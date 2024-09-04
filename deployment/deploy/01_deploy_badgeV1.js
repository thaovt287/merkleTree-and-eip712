const { DeployHelper } = require("../utils");

async function main() {
    const CONTRACT_NAME = "BadgeV1";

    const ENV_KEY = process.env.DEPLOYMENT_ENV;
    const initialAdmin = process.env["DEPLOYER_" + ENV_KEY];
    const adminAddress = "0xaBdE395073F20e1E928763AA09A738f09c92ED7b";
    const name = "BadgeV1";
    const version = "1";

    const INITIALIZATION_ARGS = [initialAdmin, adminAddress, name, version];
    const IMPL_CONSTRUCTOR_ARGS = [];

    await DeployHelper.deploy(
        CONTRACT_NAME,
        INITIALIZATION_ARGS,
        true,
        IMPL_CONSTRUCTOR_ARGS,
    );
}

main()
    .then(() => {})
    .catch((error) => {
        console.error(("Error:", error));
        process.exit(1);
    });
