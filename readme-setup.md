```shell
npm create vite@latest .
# -y
# Ignore Existing and Continue
# React Compiler
# dont use experimental rolldown
npm install tailwindcss @tailwindcss/vite
```

```ts
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    ...,
    server:{
        watch:{
            usePolling:true,
        },
        host: true,
    },
    plugins:[
        tailwindcss(),
    ]
    ...
})
```

replace contents of index.css with
```css
@import "tailwindcss";
```

follow this guide https://ui.shadcn.com/docs/installation/vite