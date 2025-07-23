#!/bin/bash

# Deploy script for blog-payload
# Usage: ./scripts/deploy.sh <image_name>

set -e

IMAGE_NAME=${1:-"blog-payload:latest"}

echo "🚀 Démarrage du déploiement de $IMAGE_NAME..."

# Vérifier que l'image existe
if ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "❌ Erreur: L'image $IMAGE_NAME n'existe pas localement"
    exit 1
fi

echo "✅ Image $IMAGE_NAME trouvée"

# Configuration du déploiement (à adapter selon l'environnement)
CONTAINER_NAME="blog-payload-prod"
PORT=${PORT:-3000}

# Arrêter le conteneur existant s'il existe
if docker ps -a --format 'table {{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
    echo "🛑 Arrêt du conteneur existant $CONTAINER_NAME..."
    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true
fi

# Démarrer le nouveau conteneur
echo "🌟 Démarrage du nouveau conteneur..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$PORT:3000" \
    -e NODE_ENV=production \
    -e DATABASE_URI="$DATABASE_URI" \
    -e PAYLOAD_SECRET="$PAYLOAD_SECRET" \
    --health-cmd="curl --fail http://localhost:3000/ || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    "$IMAGE_NAME"

echo "⏳ Attente du démarrage du conteneur..."

# Attendre que le conteneur soit healthy
timeout=300  # 5 minutes timeout
counter=0

while [ $counter -lt $timeout ]; do
    if [ "$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME")" = "healthy" ]; then
        echo "✅ Conteneur healthy et prêt !"
        echo "🎉 Déploiement réussi ! Application disponible sur le port $PORT"
        exit 0
    fi
    
    echo "⏳ En attente du health check... (${counter}s/${timeout}s)"
    sleep 5
    counter=$((counter + 5))
done

echo "❌ Timeout: Le conteneur n'est pas devenu healthy dans les temps impartis"
echo "📋 Logs du conteneur:"
docker logs "$CONTAINER_NAME" --tail 20
exit 1