import OrderController from '../controllers/OrderController.js'
import ProductController from '../controllers/ProductController.js'
import RestaurantController, { restaurantHasNoOrders, checkRestaurantOwnership } from '../controllers/RestaurantController.js'
import { isLoggedIn, hasRole } from '../middlewares/AuthMiddleware.js'
import { handleFilesUpload } from '../middlewares/FileHandlerMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import { Restaurant } from '../models/models.js'

const loadFileRoutes = function (app) {
  app.route('/restaurants')
    .get(
      RestaurantController.index)
    .post(
      isLoggedIn, // comprobar que el usuario ha iniciado sesión
      hasRole('owner'), // verifique que el usuario tenga el rol de propietario
      handleFilesUpload(['heroImage', 'logo'], process.env.RESTAURANTS_FOLDER), // gestionar la subida de la imagen del restaurante
      RestaurantController.create,
      handleValidation, // Es necesario que el restaurante pertenezca al usuario que ha iniciado sesión
      checkRestaurantOwnership, // Verifique que los datos del producto incluyan valores válidos
      RestaurantController.create)

  app.route('/restaurants/:restaurantId')
    .get(RestaurantController.show)
    .put(
      isLoggedIn,
      checkEntityExists(Restaurant, 'restaurantId'), // comprobar que el restaurante existe
      hasRole('owner'),
      handleFilesUpload(['heroImage', 'logo'], process.env.RESTAURANTS_FOLDER),
      RestaurantController.update,
      handleValidation, // Es necesario que el restaurante pertenezca al usuario que ha iniciado sesión
      checkRestaurantOwnership, // Verifique que los datos del producto incluyan valores válidos
      RestaurantController.update)
    .delete(
      isLoggedIn,
      checkEntityExists(Restaurant, 'restaurantId'),
      hasRole('owner'),
      restaurantHasNoOrders, // comprobar que no haya pedidos pendientes
      handleValidation,
      RestaurantController.destroy)

  app.route('/restaurants/:restaurantId/orders')
    .get(
      isLoggedIn,
      checkEntityExists(Restaurant, 'restaurantId'),
      OrderController.indexRestaurant)

  app.route('/restaurants/:restaurantId/products')
    .get(
      isLoggedIn,
      checkEntityExists(Restaurant, 'restaurantId'),
      ProductController.indexRestaurant)

  app.route('/restaurants/:restaurantId/analytics')
    .get(
      isLoggedIn,
      checkEntityExists(Restaurant, 'restaurantId'),
      OrderController.analytics)
}
export default loadFileRoutes
