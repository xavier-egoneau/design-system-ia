// tasks/templates/ai-interface-css.js
export function getAIInterfaceCSS() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #212529;
    }
    
    .hero {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .hero p {
      font-size: 1.25rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .main-content {
      margin: -2rem auto 0;
      position: relative;
      z-index: 10;
    }
    
    .card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    @media (max-width: 1024px) {
      .card-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .main-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    
    .main-card:hover {
      transform: translateY(-5px);
    }
    
    .card-header {
      background: linear-gradient(135deg, #000091, #1212ff);
      color: white;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      transform: rotate(45deg);
      animation: shine 3s ease-in-out infinite;
    }
    
    @keyframes shine {
      0%, 100% { transform: translateX(-100%) rotate(45deg); }
      50% { transform: translateX(100%) rotate(45deg); }
    }
    
    .card-header h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 2;
    }
    
    .card-header p {
      opacity: 0.9;
      position: relative;
      z-index: 2;
    }
    
    .card-content {
      padding: 2rem;
    }
    
    .import-section {
      grid-column: 1 / -1;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #000091;
      box-shadow: 0 0 0 3px rgba(0, 0, 145, 0.1);
    }
    
    textarea.form-control {
      min-height: 200px;
      resize: vertical;
      line-height: 1.5;
    }
    
    .btn-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #000091, #1212ff);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 145, 0.3);
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-2px);
    }
    
    .btn-copy {
      background: #17a2b8;
      color: white;
    }
    
    .btn-copy:hover:not(:disabled) {
      background: #138496;
      transform: translateY(-2px);
    }
    
    .btn-copy.copied {
      background: #28a745;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    
    .status-panel {
      margin-top: 1.5rem;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.6;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    }
    
    .status-panel.info {
      background: rgba(0, 123, 255, 0.1);
      border-left-color: #007bff;
      color: #004085;
    }
    
    .status-panel.success {
      background: rgba(40, 167, 69, 0.1);
      border-left-color: #28a745;
      color: #155724;
    }
    
    .status-panel.error {
      background: rgba(220, 53, 69, 0.1);
      border-left-color: #dc3545;
      color: #721c24;
    }
    
    .status-panel.warning {
      background: rgba(255, 193, 7, 0.1);
      border-left-color: #ffc107;
      color: #856404;
    }
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
      margin: 1rem 0;
      display: none;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #000091, #1212ff);
      border-radius: 3px;
      transition: width 0.3s ease;
      width: 0%;
      position: relative;
    }
    
    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%);
      animation: progress-shine 1.5s ease-in-out infinite;
    }
    
    @keyframes progress-shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #dee2e6;
      transition: transform 0.2s ease;
    }
    
    .stat-card:hover {
      transform: scale(1.05);
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #000091;
      margin-bottom: 0.25rem;
      display: block;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }
    
    .navigation-links {
      list-style: none;
      padding: 0;
    }
    
    .navigation-links li {
      margin-bottom: 0.75rem;
    }
    
    .navigation-links a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      color: #495057;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    
    .navigation-links a:hover {
      background: #e9ecef;
      color: #000091;
      transform: translateX(5px);
    }
    
    .file-list {
      margin-top: 1rem;
      max-height: 250px;
      overflow-y: auto;
    }
    
    .file-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 0.85rem;
      border-left: 3px solid transparent;
      transition: all 0.3s ease;
    }
    
    .file-item.created {
      background: #d4edda;
      border-left-color: #28a745;
    }
    
    .file-item.error {
      background: #f8d7da;
      border-left-color: #dc3545;
    }
    
    .file-icon {
      margin-right: 0.75rem;
      font-size: 1.1rem;
    }
    
    .example-text {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #000091;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #495057;
    }
    
    .copy-action {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .copy-description {
      flex: 1;
    }
    
    .copy-description strong {
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .copy-description small {
      color: #6c757d;
    }
    
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    
    .toast.show {
      transform: translateX(0);
    }
    
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #000091;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
}