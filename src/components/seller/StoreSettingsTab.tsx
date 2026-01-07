import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Store, X } from "lucide-react";

const PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte",
  "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
];

const StoreSettingsTab = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    store_name: profile?.store_name || "",
    store_description: profile?.store_description || "",
    store_address: profile?.store_address || "",
    province: profile?.province || "",
    city: profile?.city || "",
    phone: profile?.phone || "",
    whatsapp: profile?.whatsapp || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Use apenas JPG, PNG ou WebP.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A logo deve ter no máximo 2MB.",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("store-logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("store-logos")
        .getPublicUrl(fileName);

      const logoUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: logoUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();

      toast({
        title: "Logo atualizada",
        description: "A logo da sua loja foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar logo",
        description: error.message || "Tente novamente.",
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!user || !profile?.avatar_url) return;

    setUploadingLogo(true);

    try {
      // Extract the file path from the URL
      const urlParts = profile.avatar_url.split("/store-logos/");
      if (urlParts[1]) {
        const filePath = urlParts[1].split("?")[0];
        await supabase.storage.from("store-logos").remove([filePath]);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Logo removida",
        description: "A logo da sua loja foi removida.",
      });
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover logo",
        description: error.message || "Tente novamente.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          store_name: formData.store_name,
          store_description: formData.store_description,
          store_address: formData.store_address,
          province: formData.province,
          city: formData.city,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Dados salvos",
        description: "As informações da sua loja foram atualizadas.",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold mb-4">Logo da Loja</h3>
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Logo da loja"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            {profile?.avatar_url && (
              <button
                onClick={handleRemoveLogo}
                disabled={uploadingLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3">
              Recomendamos uma imagem quadrada de pelo menos 200x200 pixels.
              Formatos aceitos: JPG, PNG, WebP (máx. 2MB).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="gap-2"
            >
              {uploadingLogo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {profile?.avatar_url ? "Alterar Logo" : "Carregar Logo"}
            </Button>
          </div>
        </div>
      </div>

      {/* Store Info Section */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold mb-4">Informações da Loja</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="store_name">Nome da Loja *</Label>
            <Input
              id="store_name"
              value={formData.store_name}
              onChange={(e) => handleInputChange("store_name", e.target.value)}
              placeholder="Ex: Electrónica Express"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="store_description">Descrição da Loja</Label>
            <Textarea
              id="store_description"
              value={formData.store_description}
              onChange={(e) => handleInputChange("store_description", e.target.value)}
              placeholder="Descreva sua loja, o que vende, diferenciais..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="store_address">Endereço *</Label>
            <Input
              id="store_address"
              value={formData.store_address}
              onChange={(e) => handleInputChange("store_address", e.target.value)}
              placeholder="Ex: Rua da Missão, nº 123"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="province">Província *</Label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => handleInputChange("province", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione...</option>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Ex: Luanda"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold mb-4">Contactos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Ex: +244 923 456 789"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              placeholder="Ex: +244 923 456 789"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default StoreSettingsTab;
