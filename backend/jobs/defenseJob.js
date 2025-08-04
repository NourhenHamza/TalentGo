import cron from "node-cron";
import Defense from "../models/Defense.js"; // adapte le chemin si besoin

// Fonction pour planifier la tâche
export function startDefenseStatusJob() {
  // Exécuter toutes les 5 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('Checking defenses to update their status...');
    try {
      const now = new Date();
      const result = await Defense.updateMany(
        { date: { $lt: now }, status: "scheduled" },
        { $set: { status: "completed" } }
      );
      console.log(`✅ Defense status updated: ${result.modifiedCount} modified`);
    } catch (error) {
      console.error('❌ Error updating defense statuses:', error);
    }
  });
}
