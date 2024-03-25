export default {
  AppClusters: parseInt(process.env["APP_CLUSTERS"]!) ?? 0,
  AppPort: parseInt(process.env["APP_PORT"]!) ?? 3000,
};
