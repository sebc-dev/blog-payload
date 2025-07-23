# Guide de Test Docker

Ce document explique comment tester la construction Docker sans passer par un PR complet.

## Options de test

### 1. Test local avec script

```bash
# Utiliser le script de test intégré
./scripts/test-docker.sh
```

Le script permet de :

- Construire l'image localement
- Tester le démarrage optionnel
- Nettoyer automatiquement les artefacts de test

### 2. Test via branche dédiée

```bash
# Créer et pousser sur la branche de test Docker
git checkout -b docker-test
git push origin docker-test
```

Cette branche déclenche automatiquement :

- Les tests complets (job test-and-secure)
- La construction Docker avec scan sécuritaire (job build-and-deploy)
- Pas de déploiement en production

### 3. Test manuel avec Docker

```bash
# Construction simple
docker build -t blog-payload:test .

# Construction avec cache et multi-plateforme
docker buildx build --platform linux/amd64 -t blog-payload:test .

# Test de démarrage
docker run -d \
  --name blog-test \
  -p 3001:3000 \
  -e DATABASE_URI="your-db-uri" \
  -e PAYLOAD_SECRET="your-secret" \
  -e NEXT_PUBLIC_SERVER_URL="http://localhost:3001" \
  blog-payload:test
```

## Bonnes pratiques

1. **Toujours tester localement d'abord** avec le script fourni
2. **Utiliser docker-test** pour validation CI/CD complète
3. **Nettoyer après tests** : `docker system prune -f`
4. **Vérifier les logs** : `docker logs blog-test`

## Résolution des problèmes courants

- **pnpm not found** : Vérifier `corepack enable` dans chaque stage
- **Build lent** : Utiliser le cache BuildKit avec `--cache-from`
- **Permissions** : Vérifier que le script est exécutable `chmod +x`
