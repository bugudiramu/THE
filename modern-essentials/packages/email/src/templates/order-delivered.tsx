import * as React from 'react';
import { Html, Head, Preview, Body, Container, Text } from '@react-email/components';

interface OrderDeliveredEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderDeliveredEmail: React.FC<OrderDeliveredEmailProps> = ({
  orderId,
  customerName,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Modern Essentials order has been delivered!</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Text>Hi {customerName},</Text>
          <Text>Your order #{orderId} has been successfully delivered. We hope you enjoy your fresh essentials!</Text>
          <Text>If you have any feedback, we'd love to hear from you.</Text>
          <Text>See you again soon!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderDeliveredEmail;
