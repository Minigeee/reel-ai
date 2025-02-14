# React Native Reusables (RNR)

Usage examples for React Native Reusables (RNR) components.

## Button

```tsx
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

function Example() {
  return (
    <Button>
      <Text>Default</Text>
    </Button>
  );
}
```

## Input

```tsx
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';

function Example() {
  const [value, setValue] = React.useState('');

  const onChangeText = (text: string) => {
    setValue(text);
  };

  return (
    <Input
      placeholder='Write some stuff...'
      value={value}
      onChangeText={onChangeText}
      aria-labelledby='inputLabel'
      aria-errormessage='inputError'
    />
  );
}
```
