
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CreateSpace() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم للمساحة المشتركة');
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('spaces')
        .insert([
          { 
            name, 
            description: description || null, 
            owner_id: user?.id 
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('تم إنشاء المساحة المشتركة بنجاح');
      // Use optional chaining to handle potentially null data
      navigate(`/spaces/${data?.id}`);
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('حدث خطأ أثناء إنشاء المساحة المشتركة');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">إنشاء مساحة مشتركة جديدة</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            اسم المساحة المشتركة
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسماً للمساحة المشتركة"
            className="w-full"
            dir="rtl"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المساحة (اختياري)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="أدخل وصفاً للمساحة المشتركة"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
            dir="rtl"
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            إلغاء
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء المساحة'}
          </Button>
        </div>
      </form>
    </div>
  );
}
