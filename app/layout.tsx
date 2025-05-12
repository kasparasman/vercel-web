import './globals.css';
import { UserProvider} from '../context/UserContext';
import Header from '../components/Header';


export const metadata = { title: 'Discussion App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Header />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
