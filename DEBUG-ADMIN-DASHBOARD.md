# Debug Blank Screen - Admin Dashboard

## 🔍 **What to Check**

### **1. Check Browser Console**
Open browser console (F12) and look for:
- JavaScript errors
- Failed network requests
- CORS errors

### **2. Check Network Tab**
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check if `/admin/dashboard` loads
5. Check status code (200, 404, 500?)

### **3. Check Page Source**
1. Right-click → "View Page Source"
2. Do you see the HTML?
3. Or is it blank?

---

## ✅ **Try These URLs**

### **Option 1: Direct Route**
```
http://localhost:3000/admin/dashboard
```

### **Option 2: Static File (if public folder is served)**
```
http://localhost:3000/company-admin-dashboard.html
```

### **Option 3: Public Route**
```
http://localhost:3000/public/company-admin-dashboard.html
```

---

## 🚨 **Common Issues**

### **Issue 1: JavaScript Errors**
**Symptom:** Blank screen, errors in console

**Fix:** Check console for:
- Chart.js CDN not loading
- API endpoint errors
- undefined variables

### **Issue 2: Login Overlay Blocking**
**Symptom:** See login form but blank after login

**Fix:** Check localStorage:
```javascript
localStorage.getItem('idealfit_admin_logged_in')
```

### **Issue 3: API Calls Failing**
**Symptom:** Page loads but no data

**Fix:** Check Network tab for:
- `/api/admin?action=getStats` - 404?
- `/api/admin?action=getAllMerchants` - 404?

---

## 🔧 **Quick Test**

### **Test 1: View Source**
1. Go to `/admin/dashboard`
2. Right-click → View Source
3. **Do you see HTML?**
   - ✅ YES → JavaScript issue
   - ❌ NO → Route issue

### **Test 2: Check Console**
1. Open Console (F12)
2. Look for red errors
3. **Any errors?**
   - ✅ Share them
   - ❌ No errors → Check Network tab

### **Test 3: Test API**
Open browser console and run:
```javascript
fetch('/api/admin?action=getStats')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**What do you see?**
- ✅ Data → API works
- ❌ Error → API issue

---

## 📞 **Share This Info**

1. **Browser console errors** (F12 → Console)
2. **Network tab** (F12 → Network → Reload)
3. **Page source** (Right-click → View Source)
4. **URL you're using**
5. **What you see** (blank? login form? error?)

---

## 🎯 **Most Likely Causes**

1. **Route not matching** → Try different URL
2. **JavaScript error** → Check console
3. **API endpoint wrong** → Check Network tab
4. **React Router blocking** → Check route file

---

**Try the tests above and share what you find!** 🔍

