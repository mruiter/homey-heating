import { App, FlowCardAction, ManagerSettings } from "homey";
import { DEFAULT_HEATING_PLAN } from "./helper/defaultPlan";
import { Settings, OperationMode } from "./model";
import { HeatingManagerService } from "./services/heating-manager";
import { HeatingPlanRepositoryService } from "./services/heating-plan-repository";
import { HeatingSchedulerService } from "./services/heating-scheduler/HeatingSchedulerService";
import { ILogger, LogService } from "./services/log";

type PlaceHolderArg = {
    name: string;
    id: string;
};

type PlanRefArgs = {
    plan: PlaceHolderArg;
};

type ChangePlanArgs = PlanRefArgs & {
    state: string;
};

type ChangeLogArgs = {
    state: string;
};

export class HeatingManagerApp extends App {
    private repository: HeatingPlanRepositoryService = null;
    private heatingManager: HeatingManagerService = null;
    private scheduler: HeatingSchedulerService = null;
    private logger: ILogger;
    private flowLogger: ILogger;

    public get repsitory(): HeatingPlanRepositoryService {
        return this.repository;
    }

    public get manager(): HeatingManagerService {
        return this.heatingManager;
    }

    public refreshConfig() {
        LogService.init(this);
        this.logger.information("Refreshed configuration");
        this.repository.load();
    }

    public async onInit() {
        // force init
        LogService.init(this);
        this.logger = LogService.createLogger("App");
        this.flowLogger = LogService.createLogger("Flow");

        this.logger.information("Bootstrapping");
        this.bindActions();

        this.repository = new HeatingPlanRepositoryService();
        this.repository.load();

        this.heatingManager = new HeatingManagerService(this.repository);
        await this.heatingManager.applyPlans();

        this.scheduler = new HeatingSchedulerService(this.heatingManager);
        await this.scheduler.start();

        this.repository.onChanged.subscribe(async (rep, plan) => {
            await this.heatingManager.applyPlans();
            await this.scheduler.start();
        });
    }

    private bindActions() {
        new FlowCardAction("apply_all")
            .register()
            .registerRunListener(async (args, state) => {
                this.flowLogger.information("Apply plans");
                await this.heatingManger.applyPlans();
                return Promise.resolve(true);
            });

        new FlowCardAction("apply_plan")
            .register()
            .registerRunListener(async (args: PlanRefArgs, state) => {
                this.flowLogger.information(`Apply plan ${args.plan.id}`);

                const plan = await this.repository.find(args.plan.id);
                if (plan == null) { return Promise.resolve(false); }

                await this.manager.applyPlan(plan);
                return Promise.resolve(true);
            })
            .getArgument("plan")
            .registerAutocompleteListener(async (query, args) => {
                const plans = await this.repository.plans;

                return Promise.resolve(plans.map<PlaceHolderArg>((p) => { return {
                    id: p.id,
                    name: p.name || p.id,
                }; }));
            });

            
        new FlowCardAction("set_mode")
            .register()
            .registerRunListener((args: ChangeLogArgs, state) => {
                this.flowLogger.information(`Set mode ${args.state}`);

                this.heatingManager.operationMode = parseInt(args.state) as OperationMode;
                this.scheduler.start();
                
                return Promise.resolve(true);
            });

        new FlowCardAction("set_log_state")
            .register()
            .registerRunListener((args: ChangeLogArgs, state) => {
                this.flowLogger.information(`Set remote loggin ${args.state}`);

                ManagerSettings.set(Settings.LogEnabled, args.state === "true");
                LogService.init(this);

                return Promise.resolve(true);
            });
            
        new FlowCardAction("set_plan_state")
            .register()
            .registerRunListener(async (args: ChangePlanArgs, state) => {
                this.flowLogger.information(`Set plan ${args.plan.id} to ${args.state}`);

                const plan = await this.repository.find(args.plan.id);
                if (plan == null) { return Promise.resolve(false); }

                plan.enabled = args.state === "true";
                await this.repository.update(plan);

                return Promise.resolve(true);
            })
            .getArgument("plan")
            .registerAutocompleteListener(async (query, args) => {
                const plans = await this.repository.plans;

                return Promise.resolve(plans.map<PlaceHolderArg>((p) => { return {
                    id: p.id,
                    name: p.name || p.id,
                }; }));
            });
    }
}

// we are a script, but the startup class is still bound to the export
declare var module;
module.exports = HeatingManagerApp;
