// ═══════════════════════════════════════════════════════════════════════════
// MENU 3D - Visualización 3D de Mesas con Three.js
// 7 elementos visuales requeridos
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 }
  },
  lighting: {
    ambient: { color: 0xffffff, intensity: 0.6 },
    directional: { color: 0xffffff, intensity: 0.8 }
  },
  tables: {
    size: { width: 1, height: 0.5, depth: 1 },
    spacing: 2.5,
    gridColumns: 5
  },
  colors: {
    available: 0x4caf50,   // Verde
    occupied: 0xf44336,    // Rojo
    reserved: 0xffeb3b     // Amarillo
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

class Menu3D {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!this.container) {
      console.error('[Menu3D] Container not found');
      return;
    }
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.tables = [];
    this.labels = [];
    this.isInitialized = false;
    
    // Touch controls state
    this.touchState = {
      isDragging: false,
      lastTouch: null,
      lastPinchDistance: null
    };
    
    this.init();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  
  init() {
    console.log('[Menu3D] Initializing...');
    
    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);
    
    // Crear cámara
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      aspect,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    this.camera.position.set(
      CONFIG.camera.position.x,
      CONFIG.camera.position.y,
      CONFIG.camera.position.z
    );
    this.camera.lookAt(0, 0, 0);
    
    // Crear renderer WebGL con alpha y antialias
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    // Agregar iluminación
    this.setupLighting();
    
    // Agregar piso
    this.createFloor();
    
    // Configurar controles táctiles
    this.setupTouchControls();
    
    // Manejar resize
    window.addEventListener('resize', () => this.onResize());
    
    this.isInitialized = true;
    console.log('[Menu3D] Initialized successfully');
    
    // Iniciar loop de renderizado
    this.animate();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ILUMINACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  
  setupLighting() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(
      CONFIG.lighting.ambient.color,
      CONFIG.lighting.ambient.intensity
    );
    this.scene.add(ambientLight);
    
    // Luz direccional
    const directionalLight = new THREE.DirectionalLight(
      CONFIG.lighting.directional.color,
      CONFIG.lighting.directional.intensity
    );
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    console.log('[Menu3D] Lighting configured');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PISO DEL RESTAURANTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.25;
    this.scene.add(floor);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREAR MESAS 3D
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Crear representación 3D de las mesas del restaurante
   * @param {Array} tablesData - Array de mesas del backend
   */
  createTables(tablesData = []) {
    console.log('[Menu3D] Creating tables:', tablesData.length);
    
    // Limpiar mesas existentes
    this.clearTables();
    
    // Si no hay datos, crear 20 mesas de ejemplo
    if (tablesData.length === 0) {
      tablesData = this.generateSampleTables(20);
    }
    
    tablesData.forEach((tableData, index) => {
      this.createTable(tableData, index);
    });
    
    console.log('[Menu3D] Tables created:', this.tables.length);
  }

  /**
   * Crear una mesa individual
   */
  createTable(tableData, index) {
    const { width, height, depth } = CONFIG.tables.size;
    
    // Geometría BoxGeometry para la mesa
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Color según estado
    const color = this.getColorForStatus(tableData.status);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const tableMesh = new THREE.Mesh(geometry, material);
    
    // Posicionar en grid
    const col = index % CONFIG.tables.gridColumns;
    const row = Math.floor(index / CONFIG.tables.gridColumns);
    const offsetX = ((CONFIG.tables.gridColumns - 1) * CONFIG.tables.spacing) / 2;
    
    tableMesh.position.set(
      col * CONFIG.tables.spacing - offsetX,
      height / 2,
      row * CONFIG.tables.spacing - 3
    );
    
    // Guardar datos de la mesa en el mesh
    tableMesh.userData = {
      tableId: tableData.table_id || `table-${index + 1}`,
      tableNumber: tableData.table_number || `MESA-${String(index + 1).padStart(2, '0')}`,
      status: tableData.status || 'available',
      capacity: tableData.capacity || 4
    };
    
    this.scene.add(tableMesh);
    this.tables.push(tableMesh);
    
    // Crear label CSS2D
    this.createTableLabel(tableMesh);
  }

  /**
   * Crear label para la mesa usando CSS
   */
  createTableLabel(tableMesh) {
    const label = document.createElement('div');
    label.className = 'table-label';
    label.textContent = tableMesh.userData.tableNumber;
    label.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      pointer-events: none;
      transform: translate(-50%, -100%);
      white-space: nowrap;
    `;
    
    this.container.appendChild(label);
    
    const labelData = {
      element: label,
      mesh: tableMesh
    };
    
    this.labels.push(labelData);
  }

  /**
   * Actualizar posición de labels
   */
  updateLabels() {
    this.labels.forEach(labelData => {
      const { element, mesh } = labelData;
      
      // Obtener posición 3D y convertir a 2D
      const position = new THREE.Vector3();
      mesh.getWorldPosition(position);
      position.y += 0.5; // Elevar sobre la mesa
      
      // Proyectar a coordenadas de pantalla
      const projected = position.clone();
      projected.project(this.camera);
      
      const x = (projected.x * 0.5 + 0.5) * this.container.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * this.container.clientHeight;
      
      // Actualizar posición del elemento CSS
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      
      // Ocultar si está detrás de la cámara
      element.style.display = projected.z < 1 ? 'block' : 'none';
    });
  }

  /**
   * Obtener color según estado de la mesa
   */
  getColorForStatus(status) {
    switch (status?.toLowerCase()) {
      case 'available':
        return CONFIG.colors.available;
      case 'occupied':
        return CONFIG.colors.occupied;
      case 'reserved':
        return CONFIG.colors.reserved;
      default:
        return CONFIG.colors.available;
    }
  }

  /**
   * Generar mesas de ejemplo
   */
  generateSampleTables(count) {
    const statuses = ['available', 'occupied', 'reserved'];
    const tables = [];
    
    for (let i = 0; i < count; i++) {
      tables.push({
        table_id: `sample-${i + 1}`,
        table_number: `MESA-${String(i + 1).padStart(2, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        capacity: Math.floor(Math.random() * 4) + 2
      });
    }
    
    return tables;
  }

  /**
   * Limpiar mesas
   */
  clearTables() {
    this.tables.forEach(table => {
      this.scene.remove(table);
      table.geometry.dispose();
      table.material.dispose();
    });
    this.tables = [];
    
    this.labels.forEach(labelData => {
      labelData.element.remove();
    });
    this.labels = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLES TÁCTILES
  // ═══════════════════════════════════════════════════════════════════════════
  
  setupTouchControls() {
    const canvas = this.renderer.domElement;
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    
    // Mouse events para desktop
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    
    console.log('[Menu3D] Touch controls configured');
  }

  onTouchStart(event) {
    event.preventDefault();
    
    if (event.touches.length === 1) {
      this.touchState.isDragging = true;
      this.touchState.lastTouch = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    } else if (event.touches.length === 2) {
      // Pinch para zoom
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      this.touchState.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  }

  onTouchMove(event) {
    event.preventDefault();
    
    if (event.touches.length === 1 && this.touchState.isDragging) {
      // Rotar con un dedo
      const deltaX = event.touches[0].clientX - this.touchState.lastTouch.x;
      const deltaY = event.touches[0].clientY - this.touchState.lastTouch.y;
      
      this.rotateCamera(deltaX * 0.01, deltaY * 0.01);
      
      this.touchState.lastTouch = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    } else if (event.touches.length === 2) {
      // Pinch para zoom
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (this.touchState.lastPinchDistance) {
        const scale = this.touchState.lastPinchDistance / distance;
        this.zoomCamera(scale - 1);
      }
      
      this.touchState.lastPinchDistance = distance;
    }
  }

  onTouchEnd(event) {
    this.touchState.isDragging = false;
    this.touchState.lastTouch = null;
    this.touchState.lastPinchDistance = null;
  }

  onMouseDown(event) {
    this.touchState.isDragging = true;
    this.touchState.lastTouch = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event) {
    if (!this.touchState.isDragging) return;
    
    const deltaX = event.clientX - this.touchState.lastTouch.x;
    const deltaY = event.clientY - this.touchState.lastTouch.y;
    
    this.rotateCamera(deltaX * 0.005, deltaY * 0.005);
    
    this.touchState.lastTouch = { x: event.clientX, y: event.clientY };
  }

  onMouseUp() {
    this.touchState.isDragging = false;
    this.touchState.lastTouch = null;
  }

  onWheel(event) {
    event.preventDefault();
    this.zoomCamera(event.deltaY * 0.01);
  }

  /**
   * Rotar cámara alrededor del centro
   */
  rotateCamera(deltaX, deltaY) {
    const radius = this.camera.position.length();
    
    // Obtener ángulos actuales
    const theta = Math.atan2(this.camera.position.x, this.camera.position.z);
    const phi = Math.acos(this.camera.position.y / radius);
    
    // Aplicar rotación
    const newTheta = theta + deltaX;
    const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaY));
    
    // Calcular nueva posición
    this.camera.position.x = radius * Math.sin(newPhi) * Math.sin(newTheta);
    this.camera.position.y = radius * Math.cos(newPhi);
    this.camera.position.z = radius * Math.sin(newPhi) * Math.cos(newTheta);
    
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Zoom de cámara
   */
  zoomCamera(delta) {
    const minDistance = 5;
    const maxDistance = 25;
    
    const currentDistance = this.camera.position.length();
    const newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance + delta));
    
    const scale = newDistance / currentDistance;
    this.camera.position.multiplyScalar(scale);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOOP DE RENDERIZADO
  // ═══════════════════════════════════════════════════════════════════════════
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (!this.isInitialized) return;
    
    // Actualizar labels
    this.updateLabels();
    
    // Renderizar escena
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Manejar resize de ventana
   */
  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTUALIZAR ESTADO DE MESAS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Actualizar estado de una mesa específica
   */
  updateTableStatus(tableId, newStatus) {
    const table = this.tables.find(t => t.userData.tableId === tableId);
    
    if (table) {
      table.userData.status = newStatus;
      table.material.color.setHex(this.getColorForStatus(newStatus));
      console.log('[Menu3D] Updated table:', tableId, 'to', newStatus);
    }
  }

  /**
   * Actualizar todas las mesas desde el backend
   */
  async updateFromBackend() {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      
      if (data.success && data.tables) {
        this.createTables(data.tables);
      }
    } catch (error) {
      console.error('[Menu3D] Failed to fetch tables:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════
  
  dispose() {
    console.log('[Menu3D] Disposing...');
    
    // Limpiar mesas
    this.clearTables();
    
    // Limpiar escena
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
      this.scene.remove(object);
    }
    
    // Limpiar renderer
    this.renderer.dispose();
    this.renderer.domElement.remove();
    
    // Limpiar event listeners
    window.removeEventListener('resize', this.onResize);
    
    this.isInitialized = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR
// ═══════════════════════════════════════════════════════════════════════════

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.Menu3D = Menu3D;
}

export default Menu3D;
