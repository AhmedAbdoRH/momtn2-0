
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Heading,
} from '@react-email/components';

interface SpaceInvitationEmailProps {
  spaceName: string;
  inviterName: string;
  invitationLink: string;
}

export const SpaceInvitationEmail: React.FC<SpaceInvitationEmailProps> = ({
  spaceName,
  inviterName,
  invitationLink,
}) => {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>دعوة للانضمام إلى مساحة مشتركة في تطبيق الامتنان</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>دعوة للانضمام إلى مساحة مشتركة</Heading>
          
          <Text style={styles.text}>
            مرحباً،
          </Text>
          
          <Text style={styles.text}>
            لقد قام <strong>{inviterName}</strong> بدعوتك للانضمام إلى مساحة "<strong>{spaceName}</strong>" في تطبيق الامتنان.
          </Text>
          
          <Section style={styles.buttonContainer}>
            <Link 
              href={invitationLink}
              style={styles.button}
            >
              قبول الدعوة
            </Link>
          </Section>
          
          <Text style={styles.text}>
            أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:
          </Text>
          
          <Text style={styles.link}>
            {invitationLink}
          </Text>
          
          <Hr style={styles.hr} />
          
          <Text style={styles.footer}>
            إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0',
    width: '100%',
    maxWidth: '600px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
    color: '#333',
  },
  text: {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#333',
    marginBottom: '16px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  button: {
    backgroundColor: '#ea384c',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
  },
  link: {
    fontSize: '14px',
    color: '#1d4ed8',
    marginBottom: '24px',
    wordBreak: 'break-all' as const,
  },
  hr: {
    borderColor: '#e6ebf1',
    margin: '20px 0',
  },
  footer: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '20px',
  },
};

export default SpaceInvitationEmail;
