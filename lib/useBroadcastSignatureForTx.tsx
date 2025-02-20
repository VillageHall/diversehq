import { useBroadcastOnchainMutation } from '../graphql/generated'
import { pollUntilIndexed } from './indexer/has-transaction-been-indexed'

const useBroadcastSignatureForTx = (waitForTxIndex = true) => {
  const { mutateAsync: broadCast } = useBroadcastOnchainMutation()
  // use broadcast for gasless transactions
  const broadCastSignatureForTx = async (signature, id) => {
    const broadcastResult = (
      await broadCast({
        request: {
          id,
          signature
        }
      })
    ).broadcastOnchain
    if (broadcastResult.__typename === 'RelayError') {
      throw new Error(broadcastResult.reason)
    }
    if (!broadcastResult.txId) {
      throw new Error('broadcastResult.txHash is undefined')
    }
    if (!waitForTxIndex) {
      return broadcastResult
    }
    const indexedResult = await pollUntilIndexed({
      txId: broadcastResult.txId
    })
    return indexedResult
  }

  return broadCastSignatureForTx
}

export default useBroadcastSignatureForTx
