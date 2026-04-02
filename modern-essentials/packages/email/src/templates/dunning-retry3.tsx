import * as React from 'react';
import { Html, Button, Head, Preview, Body, Container, Text, Heading } from '@react-email/components';

interface DunningRetry3EmailProps {
  name: string;
  updatePaymentUrl: string;
}

export const DunningRetry3Email: React.FC<DunningRetry3EmailProps> = ({
  name,
  updatePaymentUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Final Notice: Your subscription will be cancelled tomorrow</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Heading>Hi {name},</Heading>
          <Text style={{ color: '#E53E3E', fontWeight: 'bold' }}>FINAL NOTICE: Your subscription is about to be cancelled.</Text>
          <Text>We've tried charging your card several times but haven't been successful.</Text>
          <Text>Unless payment is received by tomorrow, your subscription will be cancelled and your deliveries will stop.</Text>
          <Button href={updatePaymentUrl} style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
            Update Payment Now
          </Button>
          <Text>Don't let your deliveries stop! If you have any questions, just reply to this email!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DunningRetry3Email;
