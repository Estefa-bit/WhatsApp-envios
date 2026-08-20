#!/usr/bin/env bash
# Exit on error
set -o errexit

# Instalar dependencias
npm install

# Descargar e instalar Chrome para Puppeteer
npx puppeteer browsers install chrome