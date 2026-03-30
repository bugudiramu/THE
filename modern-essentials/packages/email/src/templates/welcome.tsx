import * as React from 'react';
import { Html, Button, Head, Preview, Body, Container, Text, Heading } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Modern Essentials!</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Heading>Welcome, {name}!</Heading>
          <Text>We're thrilled to have you join the Modern Essentials family.</Text>
          <Text>Our mission is to bring radical transparency and the freshest essentials directly to your doorstep.</Text>
          <Text>Starting with farm-fresh eggs, we're redefining what it means to eat honestly.</Text>
          <Button href="https://modernessentials.in/products">
            Start Shopping
          </Button>
          <Text>If you have any questions, just reply to this email!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
