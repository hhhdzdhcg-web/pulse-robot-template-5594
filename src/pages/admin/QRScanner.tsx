import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRScanner from '@/components/QRScanner';
import { authFetch } from '@/lib/authFetch';
import { API_ENDPOINTS } from '@/config/api';
import { User } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle2, Mail, Phone, GraduationCap, Award, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function QRScannerPage() {
  const { user: currentUser } = useAuth();
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    setError('');
    setScannedUser(null);
    setIsLoading(true);

    // QR kod ma'lumotini tekshirish - 7 ta harfdan oshmasligi kerak
    if (decodedText.length > 7) {
      setError('Bunday ma\'lumot mavjud emas. QR kod 7 ta belgidan oshmasligi kerak.');
      setIsLoading(false);
      return;
    }

    try {
      // API ga so'rov yuborish
      const response = await authFetch(API_ENDPOINTS.CHECK_USER, {
        method: 'POST',
        body: JSON.stringify({ uuid: decodedText }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Bazada bunday foydalanuvchi mavjud emas');
        } else {
          setError('Ma\'lumotni tekshirishda xatolik yuz berdi');
        }
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      setScannedUser(userData);
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Ma\'lumotni tekshirishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelText = (level?: string) => {
    switch (level) {
      case 'beginner': return 'Boshlang\'ich';
      case 'intermediate': return 'O\'rta';
      case 'expert': return 'Ekspert';
      default: return level || '-';
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (currentUser?.role !== 'admin') return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">QR Kod Skaner</h1>
            <p className="text-muted-foreground mt-1">
              Talaba QR kodini skanerlang va ma'lumotlarini ko'ring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle>QR Kod Skanerlash</CardTitle>
              <CardDescription>
                Talaba QR kodini kamera orqali skanerlang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <QRScanner 
                  onScanSuccess={handleScanSuccess}
                  trigger={
                    <Card className="w-full h-64 flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors border-2 border-dashed">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📷</div>
                        <p className="text-lg font-medium">QR Kod Skanerlash</p>
                        <p className="text-sm text-muted-foreground">Bosing va kamerani yoqing</p>
                      </div>
                    </Card>
                  }
                />
              </div>

              {isLoading && (
                <Alert>
                  <AlertDescription>
                    Ma'lumotlar tekshirilmoqda...
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {scannedUser && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Foydalanuvchi topildi!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* User Info Section */}
          {scannedUser && (
            <Card>
              <CardHeader>
                <CardTitle>Talaba Ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={scannedUser.photo} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {scannedUser.first_name?.[0]}{scannedUser.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">
                      {scannedUser.first_name} {scannedUser.last_name}
                    </h3>
                    <p className="text-muted-foreground">@{scannedUser.username}</p>
                    <Badge className={`mt-2 ${getLevelColor(scannedUser.level)}`}>
                      {getLevelText(scannedUser.level)}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">UUID:</span>
                    <span className="text-muted-foreground">{scannedUser.uuid || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Telefon:</span>
                    <span className="text-muted-foreground">{scannedUser.phone_number}</span>
                  </div>
                  {scannedUser.tg_username && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Telegram:</span>
                      <span className="text-muted-foreground">@{scannedUser.tg_username}</span>
                    </div>
                  )}
                </div>

                {/* Academic Info */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Kurs:</span>
                    <span className="text-muted-foreground">{scannedUser.course || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Yo'nalish:</span>
                    <span className="text-muted-foreground">{scannedUser.direction || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tangalar:</span>
                    <Badge variant="secondary" className="gap-1">
                      <span className="text-yellow-500">⭐</span>
                      {scannedUser.coins || 0}
                    </Badge>
                  </div>
                </div>

                {/* Status */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Holat:</span>
                    <Badge variant={scannedUser.is_active ? 'default' : 'destructive'}>
                      {scannedUser.is_active ? 'Faol' : 'Bloklangan'}
                    </Badge>
                  </div>
                </div>

                {/* Certificates Section */}
                <div className="pt-3 border-t">
                  <h4 className="font-semibold mb-3">Sertifikatlar</h4>
                  <Alert>
                    <AlertDescription className="text-center text-muted-foreground">
                      📄 Sertifikatlar tez orada qo'shiladi
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State when no user scanned */}
          {!scannedUser && !error && !isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-lg">QR kodni skanerlang</p>
                  <p className="text-sm">Talaba ma'lumotlari bu yerda ko'rsatiladi</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
