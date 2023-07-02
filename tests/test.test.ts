import { test, expect } from '@playwright/test';

test('Вёрстка главной страницы соответствует эталону', async ({page}) => {
  await page.goto('http://localhost:3000/hw/store');
  
  await page.setViewportSize({width: 1920, height: 1080});

  await expect(page.locator('html')).toHaveScreenshot();
})

test('Вёрстка страницы "условия доставки" соответствует эталону', async ({page}) => {
  await page.goto('http://localhost:3000/hw/store/delivery');
  
  await page.setViewportSize({width: 1920, height: 1080});

  await expect(page.locator('html')).toHaveScreenshot();
})

test('Вёрстка страницы "контакты" соответствует эталону', async ({page}) => {
  await page.goto('http://localhost:3000/hw/store/contacts');
  
  await page.setViewportSize({width: 1920, height: 1080});

  await expect(page.locator('html')).toHaveScreenshot();
})

test('Вёрстка страницы "каталог" соответствует эталону', async ({page}) => {
  await page.goto('http://localhost:3000/hw/store/catalog');
  
  await page.setViewportSize({width: 1920, height: 1080});

  await expect(page.locator('html')).toHaveScreenshot({mask:[page.getByRole('heading').filter({hasNotText:"Catalog"}), page.getByText("$")]});
})

test('Вёрстка страницы товара соответствует эталону', async ({page}) => {
  await page.goto('http://localhost:3000/hw/store/catalog/1');
  
  await page.setViewportSize({width: 1920, height: 1080});

  await expect(page.locator('html')).toHaveScreenshot({mask: [
    page.getByTestId("product-name"),
    page.getByTestId("product-description"),
    page.getByTestId("product-price"),
    page.getByTestId("product-color"),
    page.getByTestId("product-material")]});
})

test('При переходе на страницу продукта отображается нужная страница', async ({page}) => {
  const testProductId = "1";

  await page.goto('http://localhost:3000/hw/store/catalog');

  const testProductName = await page.getByTestId(testProductId).getByRole('heading').textContent();;

  await page.goto('http://localhost:3000/hw/store/catalog/' + testProductId);

  testProductName !== null &&
  expect(page.getByText(testProductName)).toBeVisible();
})


test('На ширине меньше 576px навигационное меню должно скрываться за "гамбургер"', async ({ page }) => {
  await page.goto('http://localhost:3000/hw/store');

  await page.setViewportSize({width: 575, height: 770});

  await expect(page.getByText('Example storeCatalogDeliveryContactsCart')).toHaveScreenshot();
});

test('При выборе элемента из меню "гамбургера", меню должно закрываться', async ({ page }) => {
  await page.goto('http://localhost:3000/hw/store');

  await page.setViewportSize({width: 575, height: 770});

  await page.getByRole('button', { name: 'Toggle navigation' }).click();

  await page.getByRole('link', { name: 'Contacts' }).click();

  await expect(page.getByText('Example storeCatalogDeliveryContactsCart')).toHaveScreenshot();
});

test('В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней', async ({ page }) => {

  const testProducts = [2,2,6,3,5,3,3]

  for (let i of testProducts) {
    await page.goto('http://localhost:3000/hw/store/catalog/' + i);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
  }

  await expect(page.getByTestId('cart-link')).toContainText(new Set(testProducts).size.toString());
});

test('Cодержимое корзины должно сохраняться между перезагрузками страницы',async ({page}) => {
  
  const testProducts = [2,2,6,3,5,3,3]

  for (let i of testProducts) {
    await page.goto('http://localhost:3000/hw/store/catalog/' + i);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
  }

  await page.getByTestId('cart-link').click();

  page.reload();

  await expect(page.getByRole('rowheader')).toHaveCount(new Set(testProducts).size)
})

test('После оформления заказа показывается соответствующее сообщение, а корзина очищается', async ({page}) => {
  
  await page.setViewportSize({width: 1920, height: 1080});

  const testProducts = [2,2,6,3,5,3,3]

  for (let i of testProducts) {
    await page.goto('http://localhost:3000/hw/store/catalog/' + i);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
  }

  await page.getByTestId('cart-link').click();

  await page.getByLabel('Name').type("George");
  await page.getByLabel('Phone').type("1234567890");
  await page.getByLabel('Address').type("Green street, 6");

  await page.getByRole('button', { name: 'Checkout' }).click();

  await expect(page.getByText('Shopping cartWell done!Order ')).toHaveScreenshot({mask:[page.getByText("has been successfully completed")]});
})

test('Валидация номера телефона работает корректно', async ({page}) => {
  
  await page.goto('http://localhost:3000/hw/store/catalog/1');
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  await page.goto('http://localhost:3000/hw/store/cart');


  const validNumbers = ["8 987 555 1122", "+7 387 555 1122", "+7 1237654321", "1234567890", "0w0 <3       hello, world!       1235235233 3-----"];
  const invalidNumbers = ["12345f67890", "12hi34", "1234567", "123456789+0", ""];

  
  for (let x of validNumbers) {
    await page.getByLabel('Phone').clear();
    await page.getByLabel('Phone').type(x);
    
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    await expect.soft(page.getByText('Please provide a valid phone'), `Номер ${x} - должен быть валидным`).not.toBeVisible();
  }

  for (let x of invalidNumbers) {
    await page.getByLabel('Phone').clear();
    await page.getByLabel('Phone').type(x);
    
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    await expect.soft(page.getByText('Please provide a valid phone'),  `Номер ${x} - не должен быть валидным`).toBeVisible();

  }

  expect(test.info().errors, "Не все проверки пройдены").toHaveLength(0);
})
