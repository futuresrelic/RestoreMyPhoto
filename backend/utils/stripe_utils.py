"""
Stripe payment processing utilities
"""
import stripe
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe with API key from environment
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')


class StripeManager:
    """Manager for Stripe payment operations"""

    # Pricing (in cents)
    PRICE_WEEKLY = 499  # $4.99
    PRICE_MONTHLY = 1499  # $14.99
    PRICE_YEARLY = 9900  # $99.00
    PRICE_ONE_TIME_EXPORT = 149  # $1.49

    def __init__(self):
        """Initialize Stripe manager"""
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', '')

    def create_customer(self, email: str, user_id: str) -> Optional[str]:
        """
        Create a Stripe customer

        Args:
            email: Customer email
            user_id: Internal user ID

        Returns:
            Stripe customer ID or None if error
        """
        try:
            customer = stripe.Customer.create(
                email=email,
                metadata={'user_id': user_id}
            )
            logger.info(f"Created Stripe customer: {customer.id}")
            return customer.id

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating customer: {e}")
            return None

    def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Create a subscription

        Args:
            customer_id: Stripe customer ID
            price_id: Stripe price ID
            user_id: Internal user ID

        Returns:
            Subscription data or None if error
        """
        try:
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{'price': price_id}],
                metadata={'user_id': user_id}
            )

            return {
                'subscription_id': subscription.id,
                'status': subscription.status,
                'current_period_end': datetime.fromtimestamp(subscription.current_period_end)
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating subscription: {e}")
            return None

    def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        mode: str = 'subscription'
    ) -> Optional[str]:
        """
        Create a Stripe checkout session

        Args:
            customer_id: Stripe customer ID
            price_id: Stripe price ID
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect after cancelled payment
            mode: 'subscription' or 'payment'

        Returns:
            Checkout session URL or None if error
        """
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                mode=mode,
                line_items=[{'price': price_id, 'quantity': 1}],
                success_url=success_url,
                cancel_url=cancel_url,
            )

            return session.url

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {e}")
            return None

    def create_payment_intent(
        self,
        amount: int,
        customer_id: str,
        metadata: Dict[str, str]
    ) -> Optional[Dict[str, Any]]:
        """
        Create a payment intent for one-time purchases

        Args:
            amount: Amount in cents
            customer_id: Stripe customer ID
            metadata: Additional metadata

        Returns:
            Payment intent data or None if error
        """
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='usd',
                customer=customer_id,
                metadata=metadata,
                automatic_payment_methods={'enabled': True}
            )

            return {
                'payment_intent_id': intent.id,
                'client_secret': intent.client_secret,
                'status': intent.status
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {e}")
            return None

    def cancel_subscription(self, subscription_id: str) -> bool:
        """
        Cancel a subscription

        Args:
            subscription_id: Stripe subscription ID

        Returns:
            True if successful, False otherwise
        """
        try:
            stripe.Subscription.delete(subscription_id)
            logger.info(f"Cancelled subscription: {subscription_id}")
            return True

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error cancelling subscription: {e}")
            return False

    def verify_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """
        Verify and parse Stripe webhook

        Args:
            payload: Request payload
            signature: Stripe signature header

        Returns:
            Event data or None if verification fails
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return event

        except ValueError as e:
            logger.error(f"Invalid webhook payload: {e}")
            return None
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {e}")
            return None

    def get_subscription_status(self, subscription_id: str) -> Optional[Dict[str, Any]]:
        """
        Get subscription status

        Args:
            subscription_id: Stripe subscription ID

        Returns:
            Subscription data or None if error
        """
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)

            return {
                'status': subscription.status,
                'current_period_end': datetime.fromtimestamp(subscription.current_period_end),
                'cancel_at_period_end': subscription.cancel_at_period_end
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error retrieving subscription: {e}")
            return None

    def create_price_objects(self):
        """
        Create Stripe price objects (run once during setup)

        Returns:
            Dict of price IDs
        """
        try:
            # Create product
            product = stripe.Product.create(
                name='RestoreMyPhoto Premium',
                description='Premium access to AI photo restoration'
            )

            # Create prices
            weekly_price = stripe.Price.create(
                product=product.id,
                unit_amount=self.PRICE_WEEKLY,
                currency='usd',
                recurring={'interval': 'week'},
                nickname='Weekly Subscription'
            )

            monthly_price = stripe.Price.create(
                product=product.id,
                unit_amount=self.PRICE_MONTHLY,
                currency='usd',
                recurring={'interval': 'month'},
                nickname='Monthly Subscription'
            )

            yearly_price = stripe.Price.create(
                product=product.id,
                unit_amount=self.PRICE_YEARLY,
                currency='usd',
                recurring={'interval': 'year'},
                nickname='Yearly Subscription'
            )

            # One-time export product
            export_product = stripe.Product.create(
                name='Remove Watermark',
                description='One-time watermark removal'
            )

            export_price = stripe.Price.create(
                product=export_product.id,
                unit_amount=self.PRICE_ONE_TIME_EXPORT,
                currency='usd',
                nickname='Single Export'
            )

            price_ids = {
                'weekly': weekly_price.id,
                'monthly': monthly_price.id,
                'yearly': yearly_price.id,
                'one_time_export': export_price.id
            }

            logger.info(f"Created Stripe prices: {price_ids}")
            return price_ids

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating prices: {e}")
            return None


# Global instance
_stripe_manager: Optional[StripeManager] = None


def get_stripe_manager() -> StripeManager:
    """Get or create global Stripe manager instance"""
    global _stripe_manager
    if _stripe_manager is None:
        _stripe_manager = StripeManager()
    return _stripe_manager
