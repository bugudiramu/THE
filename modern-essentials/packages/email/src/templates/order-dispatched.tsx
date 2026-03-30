import * as React from 'react';
import { Html, Button, Head, Preview, Body, Container, Text } from '@react-email/components';

interface OrderDispatchedEmailProps {
  orderId: string;
  customerName: string;
  trackingUrl?: string;
}

export const OrderDispatchedEmail: React.FC<OrderDispatchedEmailProps> = ({
  orderId,
  customerName,
  trackingUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Modern Essentials order is on its way!</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Text>Hi {customerName},</Text>
          <Text>Exciting news! Your order #{orderId} has been dispatched and is on its way to you.</Text>
          {trackingUrl && (
            <Button href={trackingUrl}>
              Track Order
            </Button>
          )}
          <Text>Thank you for shopping with Modern Essentials!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderDispatchedEmail;
