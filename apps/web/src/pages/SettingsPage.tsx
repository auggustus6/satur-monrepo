import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Settings, User, Lock, MapPin } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@satur/ui';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Button, Input, Label, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import {
  formatToPhone,
  formatToCPF,
  formatToCNPJ,
  isCPF,
  isCNPJ,
  isPhone
} from 'brazilian-values';


const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório').refine((value) => {
    const cleanPhone = value.replace(/\D/g, '');
    return isPhone(cleanPhone);
  }, 'Telefone inválido'),
  documentType: z.enum(['CPF', 'CNPJ']).optional().or(z.literal('')),
  document: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
}).refine((data) => {
  // Se documentType está definido, document deve estar preenchido
  if (data.documentType && (!data.document || data.document.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Documento é obrigatório quando tipo está selecionado",
  path: ["document"],
}).refine((data) => {
  // Se document está preenchido, documentType deve estar definido
  if (data.document && data.document.trim() !== '' && !data.documentType) {
    return false;
  }
  return true;
}, {
  message: "Selecione o tipo de documento",
  path: ["documentType"],
}).refine((data) => {
  // Se documentType é CPF, validar se o documento é um CPF válido
  if (data.documentType === 'CPF' && data.document && data.document.trim() !== '') {
    const cleanDocument = data.document.replace(/\D/g, '');
    // CPF deve ter exatamente 11 dígitos e ser válido
    if (cleanDocument.length !== 11) {
      return false;
    }
    return isCPF(cleanDocument);
  }
  return true;
}, {
  message: "CPF deve ter 11 dígitos e ser válido",
  path: ["document"],
}).refine((data) => {
  // Se documentType é CNPJ, validar se o documento é um CNPJ válido
  if (data.documentType === 'CNPJ' && data.document && data.document.trim() !== '') {
    const cleanDocument = data.document.replace(/\D/g, '');
    // CNPJ deve ter exatamente 14 dígitos e ser válido
    if (cleanDocument.length !== 14) {
      return false;
    }
    return isCNPJ(cleanDocument);
  }
  return true;
}, {
  message: "CNPJ deve ter 14 dígitos e ser válido",
  path: ["document"],
}).refine((data) => {
  // Se documentType está definido, cidade deve estar preenchida
  if (data.documentType && (!data.city || data.city.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Cidade é obrigatória quando documento está preenchido",
  path: ["city"],
}).refine((data) => {
  // Se documentType está definido, endereço deve estar preenchido
  if (data.documentType && (!data.address || data.address.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Endereço é obrigatório quando documento está preenchido",
  path: ["address"],
});



const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function SettingsPage() {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('account');

  const [documentValues, setDocumentValues] = useState<{
    CPF: string;
    CNPJ: string;
  }>({
    CPF: '',
    CNPJ: '',
  });

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      documentType: user?.documentType || undefined,
      document: user?.document || '',
      city: user?.city || '',
      address: user?.address || '',
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      toast.success('Perfil atualizado com sucesso!');
      useAuthStore.getState().setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) => authService.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao alterar senha');
    },
  });

  const handleUpdateProfile = (data: UpdateProfileFormData) => {
    const cleanData = {
      ...data,
      phone: data.phone ? data.phone.replace(/\D/g, '') : '',
      document: data.document ? data.document.replace(/\D/g, '') : '',
    };
    updateProfileMutation.mutate(cleanData);
  };

  const handleChangePassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = formatToPhone(value);
    profileForm.setValue('phone', formatted);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const documentType = profileForm.getValues('documentType');
    let formatted = value;

    if (documentType === 'CPF') {
      formatted = formatToCPF(value);
    } else if (documentType === 'CNPJ') {
      formatted = formatToCNPJ(value);
    }

    // Limpar erros quando o usuário começar a digitar
    if (value.length > 0) {
      profileForm.clearErrors('document');
    }

    profileForm.setValue('document', formatted);

    if (documentType) {
      setDocumentValues(prev => ({
        ...prev,
        [documentType]: formatted
      }));
    }
  };

  const handleDocumentTypeChange = (value: 'CPF' | 'CNPJ') => {
    const currentDocumentType = profileForm.getValues('documentType');
    const currentDocument = profileForm.getValues('document');

    if (currentDocumentType && currentDocument) {
      setDocumentValues(prev => ({
        ...prev,
        [currentDocumentType]: currentDocument
      }));
    }

    // Limpar erros de validação do campo documento
    profileForm.clearErrors('document');

    profileForm.setValue('documentType', value);

    const savedValue = documentValues[value];
    profileForm.setValue('document', savedValue || '');

    // Se não há valor salvo, limpar erros novamente para garantir
    if (!savedValue) {
      profileForm.clearErrors('document');
    }
  };

  useEffect(() => {
    if (user) {
      const formattedDocument = user.document ? (
        user.documentType === 'CPF' ? formatToCPF(user.document) :
          user.documentType === 'CNPJ' ? formatToCNPJ(user.document) :
            user.document
      ) : '';

      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone ? formatToPhone(user.phone) : '',
        documentType: user.documentType || undefined,
        document: formattedDocument,
        city: user.city || '',
        address: user.address || '',
      });
      if (user.documentType && formattedDocument) {
        setDocumentValues(prev => ({
          ...prev,
          [user.documentType!]: formattedDocument
        }));
      }
    }
  }, [user, profileForm]);

  useEffect(() => {
    const subscription = profileForm.watch((value, { name }) => {
      if (name === 'documentType' && value.documentType) {
        const currentDocument = profileForm.getValues('document');
        const savedValue = documentValues[value.documentType as 'CPF' | 'CNPJ'];

        if (!currentDocument && savedValue) {
          profileForm.setValue('document', savedValue);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [profileForm, documentValues]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro: Usuário não encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="mt-2 text-gray-600">
          Configure as preferências da sua conta e da plataforma.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Minha Conta
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Alterar Senha
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Telefone <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            onChange={handlePhoneChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select
                          onValueChange={handleDocumentTypeChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CPF">CPF</SelectItem>
                            <SelectItem value="CNPJ">CNPJ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Documento
                          {profileForm.watch('documentType') && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o documento"
                            {...field}
                            onChange={handleDocumentChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cidade
                          {profileForm.watch('documentType') && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Digite a cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Endereço
                          {profileForm.watch('documentType') && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o endereço" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {user.role !== 'ADMIN' && (
                        <div>
                          <Label className="font-medium text-gray-700">Função</Label>
                          <p className="text-gray-600">{user.role}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Apenas administradores podem alterar sua função e localidade.
                          </p>
                        </div>
                      )}

                      {user.city && (
                        <div>
                          <Label className="font-medium text-gray-700">Localidade</Label>
                          <div className="mt-1">
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <MapPin className="h-3 w-3" />
                              {user.city}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
