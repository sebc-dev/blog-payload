#!/bin/bash

# Script de test Docker local
# Usage: ./scripts/test-docker.sh

set -e

echo "🐳 Test de construction Docker locale..."

# Variables
IMAGE_NAME="blog-payload"
TAG="test-$(date +%s)"
CONTAINER_NAME="${IMAGE_NAME}-test"

# Nettoyer les anciens containers/images de test
echo "🧹 Nettoyage des anciens tests..."
docker container rm -f $CONTAINER_NAME 2>/dev/null || true
docker image rm $IMAGE_NAME:test 2>/dev/null || true

# Construire l'image
echo "🏗️ Construction de l'image Docker..."
docker buildx build \
  --platform linux/amd64 \
  -t $IMAGE_NAME:$TAG \
  -t $IMAGE_NAME:test \
  .

if [ $? -eq 0 ]; then
  echo "✅ Image construite avec succès!"
  
  # Test optionnel : démarrer le container
  read -p "Voulez-vous tester le démarrage du container ? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Test de démarrage du container..."
    docker run -d \
      --name $CONTAINER_NAME \
      -p 3001:3000 \
      -e DATABASE_URI="postgresql://test:test@host.docker.internal:5432/test" \
      -e PAYLOAD_SECRET="test-secret-key-32-chars-long" \
      -e NEXT_PUBLIC_SERVER_URL="http://localhost:3001" \
      $IMAGE_NAME:test
    
    echo "Container démarré sur http://localhost:3001"
    echo "Pour arrêter: docker stop $CONTAINER_NAME"
  fi
else
  echo "❌ Échec de la construction!"
  exit 1
fi