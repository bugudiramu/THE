import * as React from 'react';
import { Html, Button, Head, Preview, Body, Container, Text, Heading } from '@react-email/components';

interface DunningRetry1EmailProps {
  name: string;
  updatePaymentUrl: string;
}

export const DunningRetry1Email: React.FC<DunningRetry1EmailProps> = ({
  name,
  updatePaymentUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Payment failed for your Modern Essentials subscription</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Heading>Hi {name},</Heading>
          <Text>Your payment for your Modern Essentials subscription didn't go through.</Text>
          <Text>Don't worry! We'll try charging your card again in a few days. However, to ensure your delivery isn't interrupted, please update your payment method if needed.</Text>
          <Button href={updatePaymentUrl} style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
            Update Payment Method
          </Button>
          <Text>If you have any questions, just reply to this email!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DunningRetry1Email;
