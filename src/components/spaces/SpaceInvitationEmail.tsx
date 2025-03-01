
import { 
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column
} from '@react-email/components';

interface SpaceInvitationEmailProps {
  recipientName: string;
  senderName: string;
  spaceName: string;
  inviteLink: string;
}

export const SpaceInvitationEmail = ({
  recipientName,
  senderName,
  spaceName,
  inviteLink,
}: SpaceInvitationEmailProps) => {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>لقد تمت دعوتك للانضمام إلى مساحة مشتركة جديدة</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={title}>دعوة للانضمام إلى مساحة مشتركة</Text>
          </Section>
          <Section style={content}>
            <Text style={text}>مرحباً {recipientName}،</Text>
            <Text style={text}>
              تمت دعوتك من قبل {senderName} للانضمام إلى المساحة المشتركة "{spaceName}" للمشاركة في مساحة امتنان مشتركة.
            </Text>

            <Section style={buttonContainer}>
              <Button pX={20} pY={12} style={button} href={inviteLink}>
                قبول الدعوة والانضمام
              </Button>
            </Section>

            <Text style={text}>
              إذا كنت تواجه مشكلة في النقر على الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
            </Text>
            <Text style={link}>{inviteLink}</Text>

            <Hr style={hr} />
            
            <Row>
              <Column>
                <Text style={footer}>
                  تم إرسال هذه الدعوة من خلال تطبيق الامتنان المشترك.
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// أنماط البريد الإلكتروني
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Tahoma, Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '5px',
  border: '1px solid #e6ebf1',
};

const logo = {
  padding: '20px 30px',
  backgroundColor: '#2D1F3D',
  borderRadius: '5px 5px 0 0',
  marginBottom: '20px',
};

const title = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '10px 0',
};

const content = {
  padding: '0 20px',
};

const text = {
  fontSize: '16px',
  color: '#404040',
  lineHeight: '26px',
  textAlign: 'right' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#ea384c',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
  fontSize: '14px',
  textAlign: 'right' as const,
};

export default SpaceInvitationEmail;
