import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(() => {
  const isAnalyze = process.argv.includes('analyze')
  const isExample = process.argv.includes('example')

  return {
    server: {
      host: '0.0.0.0'
    },
    plugins: [
      react(),
      AutoImport({
        imports: [
          'react',
          'react-router-dom'
        ],
        dts: true,
        eslintrc: {
          enabled: true // Default `false`
        }
      }),
      dts({ rollupTypes: true }),
      isAnalyze
        ? visualizer({
          filename: path.resolve(__dirname, 'node_modules/rollup-plugin-visualizer/stats.html'),
          open: true
        })
        : undefined
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: isExample
      ? undefined
      : {
        lib: {
          entry: path.resolve(__dirname, 'src/index.tsx'),
          name: 'oooo-kit',
          fileName: 'index'
        },
        rollupOptions: {
          external: ['react', 'react-router', 'react-router-dom', 'antd'],
          output: {
            globals: {
              react: 'React',
              'react-router': 'ReactRouter',
              'react-router-dom': 'ReactRouterDOM',
              antd: 'antd'
            }
          }
        }
      }
  }
})
