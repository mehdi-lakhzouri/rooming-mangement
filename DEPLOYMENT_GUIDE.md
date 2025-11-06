# 🚀 Guide de Déploiement : Render + Vercel

## 📋 Vue d'ensemble
Ce guide vous accompagne pour déployer votre application Full-Stack :
- **Backend NestJS** → **Render** (serveur gratuit)
- **Frontend Next.js** → **Vercel** (hébergement frontend)

---

## 🎯 Étape 1 : Préparation Pré-Déploiement

### ✅ Vérifications obligatoires
```bash
# Tester que tout fonctionne en local
cd backend && npm run build && npm run start:prod
cd frontend && npm run build && npm start

# Vérifier les variables d'environnement
node validate-environment-config.js
```

### 📁 Structure des fichiers requis
```
✅ backend/.env.production  (avec Supabase + DEBUG=false)
✅ frontend/.env.production (avec URLs de production)
✅ backend/package.json     (scripts start:prod configurés)
✅ frontend/package.json    (scripts build/start configurés)
```

---

## 🔧 Étape 2 : Déploiement Backend sur Render

### 2.1 Créer le service Render
1. **Aller sur [render.com](https://render.com)**
2. **Cliquer "New"** → **"Web Service"**
3. **Connecter GitHub** → Sélectionner `mehdi-lakhzouri/romming-mangement`

### 2.2 Configuration du service
```yaml
# Configuration Render
Name: rooming-backend
Environment: Node
Region: Frankfurt (EU West 1)
Branch: master
Root Directory: backend
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm run start:prod
Instance Type: Free
```

### 2.3 Variables d'environnement Render
**Aller dans l'onglet "Environment" et ajouter :**

```bash
DATABASE_URL=postgresql://postgres.hqkfbbtvurafvrbnejgk:rooming-app2025@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.hqkfbbtvurafvrbnejgk:rooming-app2025@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

PORT=10000

NODE_ENV=production

FRONTEND_URL=https://your-frontend.vercel.app

SHEET_CODE_PREFIX=SDC

DEBUG=false

LOG_LEVEL=info
```

### 2.4 Déploiement Render
1. **Cliquer "Create Web Service"**
2. **Attendre 5-10 minutes** (le build peut être long)
3. **Noter l'URL générée** : `https://rooming-backend.onrender.com`

### 2.5 Vérification Backend
```bash
# Tester les endpoints
curl https://rooming-backend.onrender.com/api/v1
curl https://rooming-backend.onrender.com/api/v1/rooms
```

---

## 🌐 Étape 3 : Déploiement Frontend sur Vercel

### 3.1 Mettre à jour les URLs
**Remplacer les URLs dans `frontend/.env.production` :**
```bash
NEXT_PUBLIC_API_URL=https://rooming-backend.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://rooming-backend.onrender.com
```

### 3.2 Commit et push
```bash
git add frontend/.env.production
git commit -m "feat: update production URLs for deployment"
git push origin master
```

### 3.3 Déployer sur Vercel
1. **Aller sur [vercel.com](https://vercel.com)**
2. **Cliquer "New Project"**
3. **Import GitHub** → Sélectionner `mehdi-lakhzouri/romming-mangement`
4. **Configuration :**
   ```yaml
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 3.4 Variables d'environnement Vercel
**Dans l'onglet "Environment Variables" :**

```bash
NEXT_PUBLIC_API_URL=https://rooming-backend.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://rooming-backend.onrender.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_LOG_LEVEL=warn
```

### 3.5 Déploiement Vercel
1. **Cliquer "Deploy"**
2. **Attendre 2-3 minutes**
3. **Noter l'URL générée** : `https://your-app.vercel.app`

---

## 🔄 Étape 4 : Configuration CORS Final

### 4.1 Mettre à jour FRONTEND_URL sur Render
**Avec l'URL Vercel obtenue :**
1. Aller sur **Render Dashboard** → **Votre service**
2. **Environment** → **FRONTEND_URL**
3. **Changer vers** : `https://your-app.vercel.app`
4. **Sauvegarder** (redéploie automatiquement)

---

## ✅ Étape 5 : Tests de Production

### 5.1 Tests fonctionnels
```bash
# Tester l'API backend
curl https://rooming-backend.onrender.com/api/v1

# Tester le frontend
https://your-app.vercel.app
```

### 5.2 Tests WebSocket
1. Ouvrir `https://your-app.vercel.app`
2. Ouvrir **DevTools** → **Console**
3. Vérifier : `✅ WebSocket connected` (pas d'erreurs)

### 5.3 Tests CORS
1. Naviguer dans l'application
2. Tester création de rooms/sheets
3. Vérifier les API calls fonctionnent

---

## 🛠️ Étape 6 : Monitoring et Logs

### 6.1 Logs Backend (Render)
```bash
# Voir les logs en temps réel
Render Dashboard → Service → Logs
```

### 6.2 Logs Frontend (Vercel)
```bash
# Voir les logs de build/runtime  
Vercel Dashboard → Project → Functions/Edge Functions
```

### 6.3 Monitoring Base de Données
```bash
# Supabase Dashboard
https://app.supabase.com → Votre projet → Logs
```

---

## 🎯 Récapitulatif URLs

Après déploiement, vous aurez :

| Service | URL | Rôle |
|---------|-----|------|
| **Backend (Render)** | `https://rooming-backend.onrender.com` | API + WebSocket |
| **Frontend (Vercel)** | `https://your-app.vercel.app` | Interface utilisateur |
| **Database (Supabase)** | `aws-1-eu-west-1.pooler.supabase.com` | PostgreSQL |

---

## 🚨 Troubleshooting Courant

### Erreur CORS
```javascript
// Si erreurs CORS, vérifier :
// 1. FRONTEND_URL correct dans Render
// 2. URLs backend correctes dans Vercel
```

### Erreur Base de Données  
```bash
# Si connexion DB échoue :
# 1. Vérifier DATABASE_URL dans Render
# 2. Vérifier que Supabase est accessible
```

### Build Errors
```bash
# Si build échoue :
# 1. Vérifier les dépendances package.json
# 2. Tester npm run build localement
# 3. Vérifier les logs détaillés
```

### WebSocket Errors
```bash
# Si WebSocket ne fonctionne pas :
# 1. Vérifier NEXT_PUBLIC_SOCKET_URL
# 2. Vérifier CORS dans WebSocket Gateway
# 3. Tester en local d'abord
```

---

## 📝 Commandes de Déploiement Rapide

### Redéploiement Backend
```bash
git push origin master  # Redéploie automatiquement Render
```

### Redéploiement Frontend  
```bash
git push origin master  # Redéploie automatiquement Vercel
```

### Rollback
```bash
# Render : Deployments → Previous deployment → Redeploy
# Vercel : Deployments → Previous deployment → Promote to Production
```

---

## 🎉 Félicitations !

Une fois terminé, vous aurez :
- ✅ Backend NestJS déployé sur Render
- ✅ Frontend Next.js déployé sur Vercel  
- ✅ Base PostgreSQL sur Supabase
- ✅ WebSocket fonctionnel
- ✅ CORS configuré
- ✅ Logs de production optimisés

**Votre application Full-Stack est en production ! 🚀**