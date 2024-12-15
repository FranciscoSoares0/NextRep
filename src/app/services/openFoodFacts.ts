import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { IFoodProduct } from '../interfaces/foodProduct';

@Injectable({
  providedIn: 'root',
})
export class OpenFoodFactsService {
  http = inject(HttpClient);
  toastr = inject(ToastrService);

  constructor() {}

  searchFoodsByBarcode(barcode: string): Observable<IFoodProduct | null> {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        const product = response.product;
        if (!product) return null; // No product found

        // Map the product to your IFoodProduct interface
        return {
          id: product._id,
          product_name: product.product_name,
          brands: product.brands || 'Unknown brand',
          nutriments: product.nutriments,
          displayName: `${product.product_name} (${
            product.brands || 'Unknown brand'
          })`,
        } as IFoodProduct;
      }),
      catchError((error) => {
        this.toastr.error('Error fetching product by barcode.');
        return of(null); // Return null in case of error
      })
    );
  }
}
