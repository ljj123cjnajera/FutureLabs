# 🧪 GUÍA COMPLETA DE PRUEBAS - FUTURELABS

## 📋 **INSTRUCCIONES PARA PROBAR TODO EL SISTEMA**

---

## 🚀 **PASO 1: PREPARACIÓN**

### **1.1 Verificar que los servidores estén corriendo:**

```bash
# Backend (puerto 3000)
curl http://localhost:3000/api/products/featured?limit=8

# Debería devolver: {"success": true, ...}

# Frontend (puerto 8080)
curl http://localhost:8080

# Debería devolver HTML
```

### **1.2 Limpiar caché del navegador:**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### **1.3 Abrir consola del navegador:**
```
F12
```

---

## 🔐 **PASO 2: PRUEBAS DE AUTENTICACIÓN**

### **2.1 Login de Usuario**

1. **Ir a:** http://localhost:8080
2. **Click en:** "Cuenta"
3. **Ingresar:**
   ```
   Email: customer@example.com
   Password: customer123
   ```
4. **Click en:** "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Aparece notificación "Login exitoso"
- ✅ "Cuenta" cambia a "Mi Cuenta"
- ✅ En consola: `✅ Usuario autenticado`
- ✅ Token guardado en localStorage

**Verificar en consola:**
```javascript
localStorage.getItem('auth_token')
// Debería devolver: "eyJhbGciOiJIUzI1NiIs..."
```

---

### **2.2 Login de Administrador**

1. **Ir a:** http://localhost:8080/admin-login.html
2. **Ingresar:**
   ```
   Email: admin@futurelabs.com
   Password: admin123
   ```
3. **Click en:** "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Redirige a admin.html
- ✅ Se muestra el dashboard
- ✅ Token guardado

---

### **2.3 Registro de Usuario**

1. **Ir a:** http://localhost:8080
2. **Click en:** "Cuenta"
3. **Click en:** "Regístrate aquí"
4. **Completar formulario:**
   ```
   Nombre: Test
   Apellido: Usuario
   Email: test@example.com
   Teléfono: 999999999
   Contraseña: test123
   Confirmar Contraseña: test123
   ```
5. **Click en:** "Crear Cuenta"

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Aparece notificación "Registro exitoso"
- ✅ Usuario autenticado automáticamente

---

### **2.4 Verificar Perfil**

1. **Hacer login** (si no estás autenticado)
2. **Click en:** "Mi Cuenta"

**Resultado Esperado:**
- ✅ Se carga profile.html
- ✅ Se muestran datos del usuario
- ✅ Se muestran estadísticas
- ✅ En consola: `✅ Usuario autenticado, cargando perfil`

---

## 🛍️ **PASO 3: PRUEBAS DE PRODUCTOS**

### **3.1 Ver Productos Destacados**

1. **Ir a:** http://localhost:8080
2. **Scroll hasta:** Sección "Productos Destacados"

**Resultado Esperado:**
- ✅ Se muestran productos
- ✅ Imágenes cargadas
- ✅ Precios mostrados
- ✅ Botones "Agregar" y "Comprar" visibles

---

### **3.2 Ver Detalle de Producto**

1. **Click en:** Cualquier producto destacado

**Resultado Esperado:**
- ✅ Se carga product-detail.html
- ✅ Se muestra información completa
- ✅ Se muestran especificaciones
- ✅ Se muestran reviews
- ✅ Se muestran productos relacionados

---

### **3.3 Búsqueda de Productos**

1. **Ir a:** http://localhost:8080
2. **Escribir en búsqueda:** "laptop"
3. **Presionar:** Enter

**Resultado Esperado:**
- ✅ Se muestran sugerencias
- ✅ Al presionar Enter, se muestran resultados
- ✅ Se pueden filtrar productos

---

## 🛒 **PASO 4: PRUEBAS DE CARRITO**

### **4.1 Agregar Producto al Carrito**

1. **Hacer login** (si no estás autenticado)
2. **Ir a:** http://localhost:8080
3. **Click en:** "Agregar" de cualquier producto

**Resultado Esperado:**
- ✅ Aparece notificación "Producto agregado al carrito"
- ✅ Contador del carrito aumenta
- ✅ En consola: `✅ Producto agregado al carrito`

---

### **4.2 Ver Carrito**

1. **Click en:** Icono del carrito (arriba a la derecha)

**Resultado Esperado:**
- ✅ Se carga cart.html
- ✅ Se muestran productos agregados
- ✅ Se muestra total
- ✅ Se pueden actualizar cantidades
- ✅ Se pueden eliminar productos

---

### **4.3 Actualizar Cantidad**

1. **En el carrito, cambiar cantidad** de un producto
2. **Click en:** Botón de actualizar

**Resultado Esperado:**
- ✅ Cantidad se actualiza
- ✅ Total se recalcula
- ✅ Notificación de éxito

---

### **4.4 Eliminar Producto del Carrito**

1. **En el carrito, click en:** "Eliminar" de un producto

**Resultado Esperado:**
- ✅ Producto se elimina
- ✅ Total se actualiza
- ✅ Notificación "Producto eliminado del carrito"

---

## ❤️ **PASO 5: PRUEBAS DE WISHLIST**

### **5.1 Agregar a Favoritos**

1. **Hacer login** (si no estás autenticado)
2. **Ir a:** http://localhost:8080
3. **Click en:** Corazón de cualquier producto

**Resultado Esperado:**
- ✅ Aparece notificación "Agregado a favoritos"
- ✅ Corazón cambia a relleno
- ✅ En consola: `✅ Agregado a favoritos`

---

### **5.2 Ver Wishlist**

1. **Click en:** "Mi Cuenta"
2. **Click en:** "Favoritos" o ir a http://localhost:8080/wishlist.html

**Resultado Esperado:**
- ✅ Se muestran productos guardados
- ✅ Se pueden eliminar de favoritos
- ✅ Se pueden agregar al carrito

---

### **5.3 Remover de Favoritos**

1. **En wishlist, click en:** Corazón de un producto

**Resultado Esperado:**
- ✅ Producto se elimina de wishlist
- ✅ Notificación "Eliminado de favoritos"

---

## 💳 **PASO 6: PRUEBAS DE CHECKOUT**

### **6.1 Proceso de Checkout**

1. **Agregar productos al carrito**
2. **Ir a:** http://localhost:8080/checkout.html

**Resultado Esperado:**
- ✅ Se muestra resumen de compra
- ✅ Se pueden ingresar datos de envío
- ✅ Se pueden aplicar cupones
- ✅ Se muestra total

---

### **6.2 Aplicar Cupón**

1. **En checkout, ingresar cupón:** "DESCUENTO10"
2. **Click en:** "Aplicar"

**Resultado Esperado:**
- ✅ Cupón se aplica
- ✅ Descuento se muestra
- ✅ Total se actualiza

---

### **6.3 Procesar Pago**

1. **Completar datos de envío**
2. **Seleccionar método de pago**
3. **Click en:** "Procesar Pago"

**Resultado Esperado:**
- ✅ Orden se crea
- ✅ Redirige a confirmación
- ✅ Se muestra número de orden

---

## ⭐ **PASO 7: PRUEBAS DE REVIEWS**

### **7.1 Ver Reviews de Producto**

1. **Ir a:** Detalle de cualquier producto
2. **Scroll hasta:** Sección de reviews

**Resultado Esperado:**
- ✅ Se muestran reviews existentes
- ✅ Se muestra calificación promedio
- ✅ Se muestran estrellas

---

### **7.2 Crear Review**

1. **Hacer login** (si no estás autenticado)
2. **Ir a:** Detalle de un producto
3. **Scroll hasta:** Sección de reviews
4. **Click en:** "Escribir una reseña"
5. **Completar:**
   - Calificación (estrellas)
   - Título
   - Comentario
6. **Click en:** "Enviar Reseña"

**Resultado Esperado:**
- ✅ Review se crea
- ✅ Aparece en la lista
- ✅ Calificación se actualiza

---

## 🔍 **PASO 8: PRUEBAS DE BÚSQUEDA**

### **8.1 Búsqueda Básica**

1. **Ir a:** http://localhost:8080
2. **Escribir en búsqueda:** "smartphone"
3. **Presionar:** Enter

**Resultado Esperado:**
- ✅ Se muestran resultados
- ✅ Se pueden filtrar
- ✅ Se pueden ordenar

---

### **8.2 Autocompletado**

1. **Ir a:** http://localhost:8080
2. **Escribir en búsqueda:** "lap"

**Resultado Esperado:**
- ✅ Aparecen sugerencias
- ✅ Se pueden seleccionar

---

## 🔄 **PASO 9: PRUEBAS DE COMPARADOR**

### **9.1 Agregar Productos al Comparador**

1. **Ir a:** http://localhost:8080
2. **Click en:** Icono de comparar (balanza) de varios productos

**Resultado Esperado:**
- ✅ Aparece componente flotante
- ✅ Contador aumenta
- ✅ Notificación de éxito

---

### **9.2 Ver Comparación**

1. **Click en:** Componente flotante del comparador

**Resultado Esperado:**
- ✅ Se carga compare.html
- ✅ Se muestran productos comparados
- ✅ Se comparan especificaciones

---

### **9.3 Remover del Comparador**

1. **En comparador, click en:** "X" de un producto

**Resultado Esperado:**
- ✅ Producto se elimina
- ✅ Comparación se actualiza

---

## 📝 **PASO 10: PRUEBAS DE BLOG**

### **10.1 Ver Blog**

1. **Ir a:** http://localhost:8080/blog.html

**Resultado Esperado:**
- ✅ Se muestran posts del blog
- ✅ Se puede paginar
- ✅ Se pueden filtrar por categoría

---

### **10.2 Ver Post Individual**

1. **Click en:** Cualquier post del blog

**Resultado Esperado:**
- ✅ Se muestra contenido completo
- ✅ Se muestra autor
- ✅ Se muestra fecha
- ✅ Se muestran posts relacionados

---

## 👨‍💼 **PASO 11: PRUEBAS DE PANEL DE ADMINISTRACIÓN**

### **11.1 Login de Admin**

1. **Ir a:** http://localhost:8080/admin-login.html
2. **Ingresar:**
   ```
   Email: admin@futurelabs.com
   Password: admin123
   ```
3. **Click en:** "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Redirige a admin.html
- ✅ Se muestra dashboard

---

### **11.2 Dashboard**

1. **Verificar estadísticas:**
   - Total de productos
   - Total de usuarios
   - Total de órdenes
   - Ingresos

**Resultado Esperado:**
- ✅ Se muestran números correctos
- ✅ Gráficos se renderizan

---

### **11.3 CRUD de Productos**

#### **Crear Producto:**
1. **Click en:** "Productos"
2. **Click en:** "Crear Producto"
3. **Completar formulario**
4. **Click en:** "Guardar"

**Resultado Esperado:**
- ✅ Producto se crea
- ✅ Aparece en la lista

#### **Editar Producto:**
1. **Click en:** "Editar" de un producto
2. **Modificar datos**
3. **Click en:** "Guardar"

**Resultado Esperado:**
- ✅ Producto se actualiza
- ✅ Cambios se reflejan

#### **Eliminar Producto:**
1. **Click en:** "Eliminar" de un producto
2. **Confirmar eliminación**

**Resultado Esperado:**
- ✅ Producto se elimina
- ✅ Desaparece de la lista

---

## 📱 **PASO 12: PRUEBAS DE RESPONSIVE**

### **12.1 Mobile (< 768px)**

1. **Abrir DevTools** (F12)
2. **Click en:** Toggle Device Toolbar (Ctrl+Shift+M)
3. **Seleccionar:** iPhone 12 Pro
4. **Navegar por el sitio**

**Resultado Esperado:**
- ✅ Menú hamburguesa funciona
- ✅ Contenido se adapta
- ✅ Botones son accesibles
- ✅ Imágenes se ajustan

---

### **12.2 Tablet (768px - 1024px)**

1. **Cambiar a:** iPad
2. **Navegar por el sitio**

**Resultado Esperado:**
- ✅ Layout se adapta
- ✅ Grid se ajusta
- ✅ Navegación funciona

---

### **12.3 Desktop (> 1024px)**

1. **Cambiar a:** Desktop
2. **Navegar por el sitio**

**Resultado Esperado:**
- ✅ Layout completo
- ✅ Megamenú funciona
- ✅ Todas las funcionalidades visibles

---

## 📊 **CHECKLIST DE VERIFICACIÓN**

### **Funcionalidades Core:**
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Perfil se carga
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] Wishlist funciona
- [ ] Checkout funciona
- [ ] Reviews funcionan
- [ ] Búsqueda funciona
- [ ] Comparador funciona
- [ ] Blog funciona
- [ ] Panel de admin funciona

### **Errores:**
- [ ] Sin errores en consola
- [ ] Sin errores 500
- [ ] Sin errores 404
- [ ] Sin errores de sintaxis

### **UI/UX:**
- [ ] Responsive funciona
- [ ] Notificaciones aparecen
- [ ] Modales funcionan
- [ ] Animaciones suaves
- [ ] Carga rápida

---

## 🐛 **SI HAY ERRORES:**

### **1. Copiar TODOS los errores de la consola**

### **2. Verificar backend:**
```bash
tail -f /tmp/backend_fixed.log
```

### **3. Verificar base de datos:**
```bash
psql -U luis -d futurelabs -c "SELECT COUNT(*) FROM products;"
```

### **4. Limpiar caché:**
```javascript
localStorage.clear()
```

---

## 📝 **FORMATO DE REPORTE:**

```markdown
**Funcionalidad probada:**
[Describe qué probaste]

**Resultado esperado:**
[Describe qué debería pasar]

**Resultado real:**
[Describe qué pasó realmente]

**Errores en consola:**
[Pega los errores]

**Screenshot:**
[Si es posible, adjunta screenshot]
```

---

**¡Listo para probar!** 🚀




