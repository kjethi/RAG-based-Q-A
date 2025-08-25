export default () => ({
  admin: {
    defaultEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    defaultName: process.env.DEFAULT_ADMIN_NAME || 'System Administrator',
    defaultEditorEmail: process.env.DEFAULT_EDITOR_EMAIL || 'editor@example.com',
    defaultEditorPassword: process.env.DEFAULT_EDITOR_PASSWORD || 'editor123',
    defaultViewerEmail: process.env.DEFAULT_VIEWER_EMAIL || 'viewer@example.com',
    defaultViewerPassword: process.env.DEFAULT_VIEWER_PASSWORD || 'viewer123',
  },
});
