import * as React from 'react';
import { Html, Button, Head, Preview, Body, Container, Text, Heading } from '@react-email/components';

interface SubscriptionCancelledEmailProps {
  name: string;
  reactivationUrl: string;
}

export const SubscriptionCancelledEmail: React.FC<SubscriptionCancelledEmailProps> = ({
  name,
  reactivationUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been cancelled</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Heading>Hi {name},</Heading>
          <Text>We're sorry to see you go! Your subscription to Modern Essentials has been cancelled due to repeated payment failures.</Text>
          <Text>We'd love to have you back! You can reactivate your subscription at any time with just one click using the link below.</Text>
          <Button href={reactivationUrl} style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
            Reactivate My Subscription
          </Button>
          <Text>We hope to serve you again soon!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionCancelledEmail;
