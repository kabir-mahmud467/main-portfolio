import app from "./app.js";
import { appConfig } from "./config/app.config.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./core/utils/logger.js";

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(appConfig.port, () => {
      logger.info(`${appConfig.name} running`, { url: `http://localhost:${appConfig.port}` });
    });
  } catch (error) {
    logger.error("Failed to start application", { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

bootstrap();
