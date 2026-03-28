package com.plumbpro.fieldcompanion

import android.app.Activity
import com.android.billingclient.api.*
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray

@CapacitorPlugin(name = "GooglePlayBilling")
class GooglePlayBillingPlugin : Plugin(), PurchasesUpdatedListener {

    private lateinit var billingClient: BillingClient
    private var purchaseCallback: PluginCall? = null

    override fun load() {
        initializeBillingClient()
    }

    private fun initializeBillingClient() {
        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    android.util.Log.i("GooglePlayBilling", "BillingClient ready")
                } else {
                    android.util.Log.e("GooglePlayBilling", "BillingClient setup failed: ${billingResult.debugMessage}")
                }
            }

            override fun onBillingServiceDisconnected() {
                android.util.Log.w("GooglePlayBilling", "BillingClient disconnected, will reconnect")
            }
        })
    }

    @com.getcapacitor.PluginMethod
    fun queryProducts(call: PluginCall) {
        val productIds = call.getArray("productIds")
        val idList = mutableListOf<String>()
        for (i in 0 until productIds.length()) {
            idList.add(productIds.getString(i))
        }

        val queryParams = QueryProductDetailsParams.newBuilder()
            .setProductList(idList.map { productId ->
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()
            })
            .build()

        billingClient.queryProductDetailsAsync(queryParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                val products = JSONArray()
                productDetailsList?.forEach { productDetails ->
                    val productObj = JSObject()
                    productObj.put("productId", productDetails.productId)
                    productObj.put("title", productDetails.title)
                    productObj.put("description", productDetails.description)

                    productDetails.subscriptionOfferDetails?.firstOrNull()?.let { offer ->
                        offer.pricingPhases.pricingPhaseList.lastOrNull()?.let { phase ->
                            productObj.put("price", phase.formattedPrice)
                            productObj.put("priceCurrencyCode", phase.priceCurrencyCode)
                            productObj.put("priceAmountMicros", phase.priceAmountMicros)
                        }
                    }
                    products.put(productObj)
                }
                call.resolve(JSObject().put("products", products))
            } else {
                call.reject("Failed to query products: ${billingResult.debugMessage}")
            }
        }
    }

    @com.getcapacitor.PluginMethod
    fun startPurchaseFlow(call: PluginCall) {
        val productId = call.getString("productId") ?: run {
            call.reject("productId is required")
            return
        }

        purchaseCallback = call

        val queryParams = QueryProductDetailsParams.newBuilder()
            .setProductList(listOf(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()
            ))
            .build()

        billingClient.queryProductDetailsAsync(queryParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList?.isNotEmpty() == true) {
                val productDetails = productDetailsList[0]
                val offerToken = productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken

                if (offerToken == null) {
                    purchaseCallback?.reject("No offers available for this product")
                    return@queryProductDetailsAsync
                }

                val billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(listOf(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .setOfferToken(offerToken)
                            .build()
                    ))
                    .build()

                activity.runOnUiThread {
                    billingClient.launchBillingFlow(activity, billingFlowParams)
                }
            } else {
                purchaseCallback?.reject("Failed to load product details: ${billingResult.debugMessage}")
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                purchases?.forEach { purchase ->
                    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        val purchaseObj = JSObject()
                        purchaseObj.put("purchaseToken", purchase.purchaseToken)
                        purchaseObj.put("orderId", purchase.orderId ?: "")
                        purchaseObj.put("productIds", JSONArray(purchase.products))
                        purchaseObj.put("purchaseTime", purchase.purchaseTime)
                        purchaseObj.put("acknowledged", purchase.isAcknowledged)
                        purchaseCallback?.resolve(purchaseObj)
                    }
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                purchaseCallback?.reject("Purchase canceled by user")
            }
            else -> {
                purchaseCallback?.reject("Purchase failed: ${billingResult.debugMessage}")
            }
        }
    }

    @com.getcapacitor.PluginMethod
    fun acknowledgeSubscription(call: PluginCall) {
        val purchaseToken = call.getString("purchaseToken") ?: run {
            call.reject("purchaseToken is required")
            return
        }

        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        ) { _, purchases ->
            val purchaseToAck = purchases.find { it.purchaseToken == purchaseToken }

            if (purchaseToAck != null && !purchaseToAck.isAcknowledged) {
                val ackParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchaseToken)
                    .build()

                billingClient.acknowledgePurchase(ackParams) { ackResult ->
                    if (ackResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        call.resolve()
                    } else {
                        call.reject("Failed to acknowledge: ${ackResult.debugMessage}")
                    }
                }
            } else {
                call.resolve()
            }
        }
    }
}
