import { Button } from '@satur/ui';

export const SharedComponentExample = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Exemplo de Componente Compartilhado</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Variantes do Button</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Tamanhos do Button</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Estados do Button</h3>
          <div className="flex flex-wrap gap-2">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Este componente demonstra como usar o Button do package @satur/ui que é compartilhado entre diferentes apps do monorepo.
        </p>
      </div>
    </div>
  );
};
