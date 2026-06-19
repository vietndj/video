import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentRouter from "./payment";
import fontsRouter from "./fonts";
import uploadRouter from "./upload";
import saveContentRouter from "./save-content";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentRouter);
router.use(fontsRouter);
router.use(uploadRouter);
router.use(saveContentRouter);

export default router;
