const Logger = require("../../Logger");

const CapabilityRouter = require("./CapabilityRouter");

const ValetudoMapSegment = require("../../entities/core/ValetudoMapSegment");

class MapSegmentationCapabilityRouter extends CapabilityRouter {

    initRoutes() {
        this.router.get("/", async (req, res) => {
            res.json(await this.capability.getSegments());
        });

        this.router.put("/", async (req, res) => {
            if (req.body && req.body.action) {
                switch (req.body.action) {
                    case "start_segment_action":
                        if (Array.isArray(req.body.segment_ids)) {
                            try {
                                await this.capability.executeSegmentAction(req.body.segment_ids.map(sid => {
                                    return new ValetudoMapSegment({
                                        id: sid
                                    });
                                }));

                                res.sendStatus(200);
                            } catch (e) {
                                Logger.warn("Error while starting segment cleaning", {
                                    body: req.body,
                                    e: e
                                });
                                res.status(500).json(e.message);
                            }
                        } else {
                            res.status(400).send("Missing segment_ids");
                        }
                        break;
                    case "join_segments":
                        if (req.body.segment_a_id && req.body.segment_b_id) {
                            try {
                                await this.capability.joinSegments(
                                    new ValetudoMapSegment({id: req.body.segment_a_id}),
                                    new ValetudoMapSegment({id: req.body.segment_b_id}),
                                );

                                res.sendStatus(200);
                            } catch (e) {
                                Logger.warn("Error while joining segments", {
                                    body: req.body,
                                    e: e
                                });
                                res.status(500).json(e.message);
                            }
                        } else {
                            res.status(400).send("Invalid request");
                        }
                        break;
                    case "split_segment":
                        if (req.body.pA && req.body.pB && req.body.segment_id) {
                            try {
                                await this.capability.splitSegment(
                                    new ValetudoMapSegment({id: req.body.segment_id}),
                                    req.body.pA,
                                    req.body.pB
                                );

                                res.sendStatus(200);
                            } catch (e) {
                                Logger.warn("Error while splitting segment", {
                                    body: req.body,
                                    e: e
                                });
                                res.status(500).json(e.message);
                            }
                        } else {
                            res.status(400).send("Invalid request");
                        }
                        break;
                    default:
                        res.status(400).send("Invalid action \"" + req.body.action + "\" in request body");
                }
            } else {
                res.status(400).send("Missing action in request body");
            }
        });
    }
}

module.exports = MapSegmentationCapabilityRouter;
