
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminCreation() {
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const createAdminUser = async (email: string, password: string) => {
    if (email !== "admin@aluguetudo.com" || password !== "admin123") {
      toast.error("Use admin@aluguetudo.com e admin123 para criar o usuário admin.");
      return;
    }

    setIsCreatingAdmin(true);
    try {
      // Verificar se já existe um admin
      const { data: existingAdmins, error: queryError } = await supabase
        .from('users')
        .select('*')
        .contains('role', ['admin'])
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      if (existingAdmins && existingAdmins.length > 0) {
        toast.warning('Já existe um usuário admin no sistema. Tente fazer login normalmente.');
        return;
      }

      // Criar usuário admin
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@aluguetudo.com',
        password: 'admin123',
        options: {
          data: {
            name: 'Administrador',
            role: ['admin'],
            status: 'ativo'
          }
        }
      });

      if (error) {
        throw error;
      }

      // Forçar inserção no banco público também
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: 'admin@aluguetudo.com',
          name: 'Administrador',
          role: ['admin'],
          status: 'ativo'
        });

      if (insertError) {
        console.warn('Erro ao inserir usuário na tabela pública:', insertError);
      }

      toast.success('Usuário admin criado com sucesso. Agora tente fazer login.');
    } catch (error: any) {
      console.error('Erro ao criar usuário admin:', error);
      toast.error(`Erro ao criar usuário admin: ${error.message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return {
    isCreatingAdmin,
    createAdminUser
  };
}
