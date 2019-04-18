import { Router, Request, Response } from 'express'
import { getProviders } from '../utils'

export class UpdateRouter {
    public router: Router

    /**
     * Initialize the UpdateRouter
     */
    public constructor() {
        this.router = Router()
    }

    public async updateDid(req: Request, res: Response) {
        if (!req.body.did || !req.body.signature) {
            return res.send({
                status: 'error',
                message: 'Missing did or signature'
            })
        }
        const providers = await getProviders()
        try {
            const userAccount = await providers.web3.eth.personal.ecRecover(
                `You are updating ${req.body.did}`,
                req.body.signature
            )
            const events = await providers.ocean.keeper.didRegistry.contract.getPastEvents(
                'DIDAttributeRegistered',
                {
                    filter: {
                        _owner: userAccount,
                        _did: req.body.did.replace('did:op:', '0x')
                    },
                    fromBlock: 0,
                    toBlock: 'latest'
                }
            )
            if (events.length > 0) {
                // TODO: update asset in Aquarius
                res.send({ status: 'success' })
            } else {
                return res.send({
                    status: 'error',
                    message: 'Not owner of asset'
                })
            }
        } catch (error) {
            return res.send({ status: 'error' })
        }
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    public init() {
        this.router.post('/', this.updateDid)
    }
}

// Create the updateRouter, and export its configured Express.Router
const updateRouter = new UpdateRouter()
updateRouter.init()

export default updateRouter.router