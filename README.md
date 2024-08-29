## install 

```js
    npm i @aigens/virtual-keyboard
```

## Using

```js
    import {
        VirtualKeyboardJs
    } from '@aigens/virtual-keyboard';

    this.virtualKeyboardJs = new VirtualKeyboardJs();

    if (this.virtualKeyboardJs.isElectron()) {
        this.virtualKeyboardJs.setInput(".installcode-input", ".installcode-kb-container", (key, input) => {
            console.log('setInput:', key, input);
        }, {
            show: false,
            autoPosition: false
        });
    }
```
