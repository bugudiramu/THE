import * as React from 'react';
import { Html, Button, Head, Preview, Body, Container, Text } from '@react-email/components';

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  total: string;
  items: Array<{ name: string; qty: number; price: string }>;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  customerName,
  total,
  items,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Modern Essentials order has been confirmed!</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Text>Hi {customerName},</Text>
          <Text>Thank you for your order! Here are your order details:</Text>
          <Text>Order ID: {orderId}</Text>
          <Text>Items:</Text>
          {items.map((item, idx) => (
            <Text key={idx}>
              {item.name} x {item.qty} - {item.price}
            </Text>
          ))}
          <Text>Total: {total}</Text>
          <Button href={`https://modernessentials.in/orders/${orderId}`}>
            View Order
          </Button>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;
