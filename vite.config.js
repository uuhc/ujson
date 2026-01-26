import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 构建后复制必要文件
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      try {
        const distDir = resolve(__dirname, 'dist');
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }

        // 复制 manifest.json
        if (existsSync(resolve(__dirname, 'manifest.json'))) {
          copyFileSync(
            resolve(__dirname, 'manifest.json'),
            resolve(distDir, 'manifest.json')
          );
        }

        // 复制 background.js
        const backgroundSrc = resolve(__dirname, 'src/background.js');
        if (existsSync(backgroundSrc)) {
          copyFileSync(backgroundSrc, resolve(distDir, 'background.js'));
        }

        // 复制 content.js
        const contentSrc = resolve(__dirname, 'src/content.js');
        if (existsSync(contentSrc)) {
          copyFileSync(contentSrc, resolve(distDir, 'content.js'));
        }

        // 复制图标文件
        const iconsDir = resolve(__dirname, 'icons');
        const distIconsDir = resolve(distDir, 'icons');
        if (!existsSync(distIconsDir)) {
          mkdirSync(distIconsDir, { recursive: true });
        }
        ['icon16.png', 'icon48.png', 'icon128.png'].forEach(icon => {
          const iconPath = resolve(iconsDir, icon);
          if (existsSync(iconPath)) {
            copyFileSync(iconPath, resolve(distIconsDir, icon));
          }
        });

        // 复制 _locales 目录
        const localesDir = resolve(__dirname, '_locales');
        if (existsSync(localesDir)) {
          const locales = readdirSync(localesDir);
          locales.forEach(locale => {
            const localeSrcDir = resolve(localesDir, locale);
            const localeDistDir = resolve(distDir, '_locales', locale);
            if (!existsSync(localeDistDir)) {
              mkdirSync(localeDistDir, { recursive: true });
            }
            const messagesFile = resolve(localeSrcDir, 'messages.json');
            if (existsSync(messagesFile)) {
              copyFileSync(messagesFile, resolve(localeDistDir, 'messages.json'));
            }
          });
        }
      } catch (error) {
        console.error('复制文件失败:', error);
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), copyExtensionFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        viewer: resolve(__dirname, 'viewer.html'),
        editor: resolve(__dirname, 'editor.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
