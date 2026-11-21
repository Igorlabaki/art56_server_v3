import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listVenueFactory } from "../use-cases/venue/list-venue/factory-list-venue";
import { deleteVenueFactory } from "../use-cases/venue/delete-venue/factory-delete-venue";
import { createVenueFactory } from "../use-cases/venue/create-venue/factory-create-session";
import { getVenuebyidFactory } from "../use-cases/venue/get-by-id-venue/factory-get-by-id-venue";
import { updateVenueFactory } from "../use-cases/venue/update-venue/factory-update-venue";
import { getVenueTrafficCountFactory } from "../use-cases/venue/get-traffic-count-venue/factory-get-traffic-count-venue";
import { getVenueAnalysiByMonthFactory } from "../use-cases/venue/get-analysis-by-month-venue/factory-get-analysis-by-month-venue";
import { listPermittedVenueFactory } from "../use-cases/venue/list-permitted-venues/factory-list-permitted-venue";
import { makeGetVenueAnalyticsController } from "../use-cases/venue/get-venue-analytics/factory-get-venue-analytics";
import multer from "multer";
import { getWebDataFactory } from "../use-cases/webData/web/factory-get-web-data";
import { updateVenuePaymentInfoFactory } from "../use-cases/venue/update-payment-info-venue/factory-update-venue";
import { updateVenueInfoFactory } from "../use-cases/venue/update-info-venue/factory-update-info-venue";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { getOccupancyReportFactory } from "../use-cases/venue/reports/occupancy/factory-get-occupancy-report";
import { getLeadTimeReportFactory } from "../use-cases/venue/reports/lead-time/factory-get-lead-time-report";
import { getServiceAdherenceReportFactory } from "../use-cases/venue/reports/service-adherence/factory-get-service-adherence-report";
import { getEventProfileReportFactory } from "../use-cases/venue/reports/event-profile/factory-get-event-profile-report";
import { getEventOriginReportFactory } from "../use-cases/venue/reports/event-origin/factory-get-event-origin-report";
import { getAdsReportFactory } from "../use-cases/venue/reports/ads/factory-get-ads-report";
import { getVenuePresentationFactory } from "../use-cases/venue/get-venue-presentation/factory-get-venue-presentation";
import { createVenueLinkFactory, getVenueLinkEditorFactory, getVenueLinksFactory, hideVenueLinkFactory, orderVenueLinksFactory, saveVenueLinksFactory, setVenueLinkVisibleFactory } from "../use-cases/venue/venue-links/factory-venue-links";
import { reorderVenueImagesFactory } from "../use-cases/venue/reorder-venue-images/factory-reorder-venue-images";
import { chooseVenueImageFactory } from "../use-cases/venue/choose-venue-image/factory-choose-venue-image";


const venueRoutes = Router()

venueRoutes.get("/presentation/:venueId", async (req, res) => {
    const controller = getVenuePresentationFactory();
    await controller.handle(req, res);
})

venueRoutes.get("/links/:venueId/editor", ensureAuthenticate, async (req, res) => {
    const controller = getVenueLinkEditorFactory();
    await controller.handle(req, res);
})

venueRoutes.get("/links/:venueId", async (req, res) => {
    const controller = getVenueLinksFactory();
    await controller.handle(req, res);
})

venueRoutes.put("/links/:venueId/order", ensureAuthenticate, async (req, res) => {
    const controller = orderVenueLinksFactory();
    await controller.handle(req, res);
})

venueRoutes.put("/links/:venueId/visible", ensureAuthenticate, async (req, res) => {
    const controller = setVenueLinkVisibleFactory();
    await controller.handle(req, res);
})

venueRoutes.put("/links/:venueId/hide", ensureAuthenticate, async (req, res) => {
    const controller = hideVenueLinkFactory();
    await controller.handle(req, res);
})

venueRoutes.put("/links/:venueId/create", ensureAuthenticate, async (req, res) => {
    const controller = createVenueLinkFactory();
    await controller.handle(req, res);
})

venueRoutes.put("/links/:venueId", ensureAuthenticate, async (req, res) => {
    const controller = saveVenueLinksFactory();
    await controller.handle(req, res);
})

venueRoutes.put("/presentation/:venueId/image-order", ensureAuthenticate, async (req, res) => {
    const controller = reorderVenueImagesFactory();
    await controller.handle(req, res);
});

venueRoutes.put("/presentation/:venueId/image-choice", ensureAuthenticate, async (req, res) => {
    const controller = chooseVenueImageFactory();
    await controller.handle(req, res);
});

// Configuração do Multer (memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const venueImages = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
]);
// Register
venueRoutes.post("/create",ensureAuthenticate, venueImages, async (req, res) => {
    const controller = createVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
// List
venueRoutes.get("/list?:organizationId?/:name?",ensureAuthenticate, async (req, res) => {
    const controller = listVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

venueRoutes.get("/permittedVenueList?:organizationId?/:name?/:userId?",ensureAuthenticate, async (req, res) => {
    const controller = listPermittedVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
venueRoutes.get("/trafficCount?:venueId/:year?/:approved?",ensureAuthenticate, async (req, res) => {
    const controller = getVenueTrafficCountFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
venueRoutes.get("/analysisByMonth?:venueId/:year?/:approved?",ensureAuthenticate, async (req, res) => {
    const controller = getVenueAnalysiByMonthFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Get by Id
venueRoutes.get("/getById?:venueId?/:userId?", async (req, res) => {
    const controller = getVenuebyidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Get by Id
venueRoutes.get("/getWebData/:venueId?", async (req, res) => {
    const controller = getWebDataFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
venueRoutes.put("/update",ensureAuthenticate, venueImages, async (req, res) => {
    const controller = updateVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
// Update
venueRoutes.put("/update/payment-info",ensureAuthenticate, async (req, res) => {
    const controller = updateVenuePaymentInfoFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
// Update
venueRoutes.put("/update/info",ensureAuthenticate, async (req, res) => {
    const controller = updateVenueInfoFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})


// Delete
venueRoutes.delete("/delete/:venueId",ensureAuthenticate, async (req, res) => {
    const controller = deleteVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Analytics
venueRoutes.get("/analytics/:venueId",ensureAuthenticate, async (req, res) => {
    const controller = makeGetVenueAnalyticsController();
    await controller.handle(req, res);
});

// Relatorios agregados (VIEW_VENUE_ANALYSIS checada no use case)
venueRoutes.get("/reports/occupancy", ensureAuthenticate, async (req, res) => {
    await getOccupancyReportFactory().handle(req as unknown as AuthenticatedRequest, res);
});
venueRoutes.get("/reports/lead-time", ensureAuthenticate, async (req, res) => {
    await getLeadTimeReportFactory().handle(req as unknown as AuthenticatedRequest, res);
});
venueRoutes.get("/reports/service-adherence", ensureAuthenticate, async (req, res) => {
    await getServiceAdherenceReportFactory().handle(req as unknown as AuthenticatedRequest, res);
});
venueRoutes.get("/reports/event-profile", ensureAuthenticate, async (req, res) => {
    await getEventProfileReportFactory().handle(req as unknown as AuthenticatedRequest, res);
});
venueRoutes.get("/reports/event-origin", ensureAuthenticate, async (req, res) => {
    await getEventOriginReportFactory().handle(req as unknown as AuthenticatedRequest, res);
});
venueRoutes.get("/reports/ads", ensureAuthenticate, async (req, res) => {
    await getAdsReportFactory().handle(req as unknown as AuthenticatedRequest, res);
});

export { venueRoutes }