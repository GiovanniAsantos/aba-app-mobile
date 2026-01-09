# MainLayout Component

Layout principal do aplicativo com barra inferior fixa e menu de navegação deslizante.

## Características

- **Barra Inferior Fixa**: 5 botões de navegação rápida na parte inferior da tela
- **Menu Deslizante**: Menu completo que sobe do fundo ao clicar no botão central
- **Gestos**: Suporta arrastar para baixo para fechar o menu
- **Overlay**: Fundo escuro semi-transparente quando o menu está aberto

## Uso

```tsx
import { MainLayout } from '@/components';

export default function MyScreen({ navigation }) {
  return (
    <MainLayout navigation={navigation}>
      {/* Seu conteúdo aqui */}
    </MainLayout>
  );
}
```

## Props

- `children`: Conteúdo da página
- `navigation`: Objeto de navegação do React Navigation (opcional)

## Funcionalidades

### Barra Inferior
- 4 botões de navegação rápida (Início, Docs, Nuvem, Perfil)
- 1 botão central elevado para abrir o menu

### Menu Deslizante
- Abre ao clicar no botão central da barra
- Pode ser fechado:
  - Clicando no overlay escuro
  - Arrastando o menu para baixo
  - Selecionando um item do menu
- Itens do menu incluem navegação completa e logout

## Personalização

Para adicionar novos itens ao menu, edite o array `menuItems` em `MainLayout.tsx`:

```tsx
const menuItems = [
  { icon: 'home', label: 'Início', screen: 'Home' },
  { icon: 'account', label: 'Perfil', screen: 'Profile' },
  // Adicione mais itens aqui
];
```
