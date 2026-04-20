import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shopyoliza/cart.dart';
import 'package:shopyoliza/detilproduct.dart';
import 'package:shopyoliza/onboardingpage.dart';
import 'dart:convert';

import 'gridelectronic.dart';
import 'gridbajupria.dart';
import 'gridbajuwanita.dart';
import 'gridsepatupria.dart';
import 'gridsepatuwanita.dart';

class HomePage extends StatefulWidget {
  final int userId;
  const HomePage({super.key, required this.userId});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<dynamic> allProductList = [];
  List<dynamic> filteredProductList = [];
  TextEditingController searchProduct = TextEditingController();
  PageController bannerController = PageController();
  Timer ? bannerTimer;
  int indexBanner = 0;

  Future<void> getAllProductItem() async{
    String urlProductItem = "https://backend-mobile.yoliza277.online/allproductitem.php"; // "http://localhost/server_shop_yoliza/allproductitem.php";
    try {
      var response = await http.get(Uri.parse(urlProductItem));
      setState(() {
        allProductList = jsonDecode(response.body);
        filteredProductList = jsonDecode(response.body);
      });
    } catch(exc) {
      if (kDebugMode) {
        print(exc);
      }
    }
  }

  void searchLogic(String keyword) {
    if (keyword.isEmpty) {
      setState(() {
        filteredProductList = allProductList;
      });
    } else {
      setState(() {
        filteredProductList = allProductList.where((item) {
          return item['name']
              .toString()
              .toLowerCase()
              .contains(keyword.toLowerCase());
        }).toList();
      });
    }
  }

  @override
  void dispose(){
    bannerController.dispose();
    bannerTimer?.cancel();
    super.dispose();
  }

  void bannerOnBoarding() {
    bannerTimer = Timer.periodic(Duration(seconds: 3), (timer) { 
      if (indexBanner < 2) {
        indexBanner++;
      } else {
        indexBanner = 0;
      }
      bannerController.animateToPage(indexBanner, duration: Duration(milliseconds: 300), curve: Curves.easeInOut);
    });
  }
  @override
  void initState() {
    super.initState();
    bannerController.addListener((){
      setState(() {
        indexBanner = bannerController.page?.round() ?? 0;
      });
    });
    bannerOnBoarding();
    getAllProductItem();
  }

  @override
  Widget build(BuildContext context) {
    List<String> bannerImage = [
      "lib/image/banner1.jpeg",
      "lib/image/banner2.jpeg",
      "lib/image/banner3.jpeg"
    ];
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OnBoardingPage(),
      ),
    );
  },
         icon: const Icon(Icons.arrow_back, size: 25, color: Colors.white,),),
        title: const Text("Yoliza Online Shop", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),),
        centerTitle: true,
        backgroundColor: Colors.green.shade400,
        actions: [
          IconButton(onPressed: () {},
         icon: const Icon(Icons.search_off_outlined, size: 25, color: Colors.white,),),
         IconButton(onPressed: () {
                  Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CartPage(userId: widget.userId,),
            ),
          );
                },
         icon: const Icon(Icons.shopping_cart, size: 25, color: Colors.white,),),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children:<Widget> [
            TextField(
              controller: searchProduct,
              onChanged: searchLogic,
              decoration: const InputDecoration(
                hintText: "Search Product",
                hintStyle: TextStyle(
                  fontSize: 13, 
                  color: Colors.black, 
                  fontWeight: FontWeight.bold
                ),
                suffixIcon: Align(
                  widthFactor: 1.0, 
                  heightFactor: 1.0,
                  child: Icon(Icons.filter_list, color: Colors.green,
                  ),
                ),
                prefixIcon: Align(
                  widthFactor: 1.0, 
                  heightFactor: 1.0,
                  child: Icon(Icons.search, color: Colors.green,
                  ),
                ),
                filled: true,
                fillColor: Color.fromARGB(255, 236, 255, 236),
                border: OutlineInputBorder(
                  borderSide: BorderSide(
                    width: 3, color: Colors.red, style: BorderStyle.solid
                  ),
                  borderRadius: BorderRadius.all(
                    Radius.circular(25),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 5),
            SizedBox(
              height: 150,
              //width: double.infinity,
              child: PageView.builder(
                controller: bannerController,
                itemCount: bannerImage.length,
                itemBuilder: (context, index) {
                  return Image.asset(bannerImage[index], fit: BoxFit.cover);
                }
              ),
            ),

            Padding(padding: EdgeInsets.all(5),
              child: SizedBox(height: 100,
              width: double.infinity,
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, 
                  children:<Widget> [
                    Card(
                      elevation: 5,
                      child: InkWell(
                        onTap: () {Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                      builder: (context) => GridElectronic(userId: widget.userId)
                                    ),
                                  );},
                        child: SizedBox(height: 80, width: 60, 
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children:<Widget> [
                              Image.asset('lib/image/elektronik.png', width: 45, height: 45),
                              Text(
                                "Electronics",
                                style: TextStyle(
                                  fontSize: 8, 
                                  fontWeight: FontWeight.bold, 
                                  color: Colors.black
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    Card(
                      elevation: 5,
                      child: InkWell(
                        onTap: () {Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                      builder: (context) => GridSepatuPria(userId: widget.userId)
                                    ),
                                  );},
                        child: SizedBox(height: 80, width: 60, 
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children:<Widget> [
                              Image.asset('lib/image/sepatu.png', width: 45, height: 45),
                              Text(
                                "Men's Shoe",
                                style: TextStyle(
                                  fontSize: 8, 
                                  fontWeight: FontWeight.bold, 
                                  color: Colors.black
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    Card(
                      elevation: 5,
                      child: InkWell(
                        onTap: () {Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                      builder: (context) => GridBajuPria(userId: widget.userId,)
                                    ),
                                  );},
                        child: SizedBox(height: 80, width: 60, 
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children:<Widget> [
                              Image.asset('lib/image/baju.png', width: 45, height: 45),
                              Text(
                                "Men's Shirt",
                                style: TextStyle(
                                  fontSize: 8, 
                                  fontWeight: FontWeight.bold, 
                                  color: Colors.black
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    Card(
                      elevation: 5,
                      child: InkWell(
                        onTap: () {Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                      builder: (context) => GridSepatuWanita(userId: widget.userId)
                                    ),
                                  );},
                        child: SizedBox(height: 80, width: 60, 
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children:<Widget> [
                              Image.asset('lib/image/heels.png', width: 45, height: 45),
                              Text(
                                "Women's Shoe",
                                style: TextStyle(
                                  fontSize: 8, 
                                  fontWeight: FontWeight.bold, 
                                  color: Colors.black
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    Card(
                      elevation: 5,
                      child: InkWell(
                        onTap: () {Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                      builder: (context) => GridBajuWanita(userId: widget.userId)
                                    ),
                                  );},
                        child: SizedBox(height: 80, width: 60, 
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children:<Widget> [
                              Image.asset('lib/image/dress.png', width: 45, height: 45),
                              Text(
                                "Women's Dress",
                                style: TextStyle(
                                  fontSize: 8, 
                                  fontWeight: FontWeight.bold, 
                                  color: Colors.black
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            Padding(
                      padding: EdgeInsets.all(5),
                      child: Column(
                        children:<Widget> [
                          Text(
                            "Our Product List",
                            style: TextStyle(
                              fontSize: 20, 
                              fontWeight: FontWeight.bold, 
                              color: Colors.black
                            ),
                          ),
                          SizedBox(height: 5),

                          if(allProductList.isEmpty || filteredProductList.isEmpty && searchProduct.text.isNotEmpty) ...[
                            Center(
                              child: Text(
                                "Product Not Found",
                                style: TextStyle(
                                  fontSize: 13, 
                                  fontWeight: FontWeight.bold, 
                                  color: Colors.black
                                ),
                              ),
                            ),
                          ] else ...[
                            GridView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                mainAxisSpacing: 5,
                                crossAxisSpacing: 5,
                              ), 
                              itemCount: filteredProductList.length,
                              itemBuilder: (context, int index) {
                                  final itemProduct = filteredProductList[index];
                                  return GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => DetilProductPage(
                                            item: itemProduct,
                                            userId: widget.userId,
                                            backPage: HomePage(userId: widget.userId),
                                          ),
                                        ),
                                      );
                                    },
                                    child: Card(
                                      elevation: 3,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          // Gambar Produk
                                          Expanded(
                                            flex: 3,
                                            child: Container(
                                              width: double.infinity,
                                              decoration: BoxDecoration(
                                                borderRadius: const BorderRadius.only(
                                                  topLeft: Radius.circular(8),
                                                  topRight: Radius.circular(8),
                                                ),
                                                color: Colors.grey[100],
                                              ),
                                              child: Image.network(
                                                itemProduct['images'],
                                                fit: BoxFit.contain,
                                                errorBuilder:
                                                    (context, error, stackTrace) {
                                                  return const Center(
                                                    child: Icon(
                                                      Icons.image_not_supported,
                                                      color: Colors.grey,
                                                    ),
                                                  );
                                                },
                                              ),
                                            ),
                                          ),

                                          // Nama Produk
                                          Padding(
                                            padding:
                                                const EdgeInsets.fromLTRB(8, 8, 8, 4),
                                            child: Text(
                                              itemProduct['name'],
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),

                                          // Harga dan Icon Hati
                                          Padding(
                                            padding:
                                                const EdgeInsets.fromLTRB(8, 0, 8, 8),
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.spaceBetween,
                                              children: <Widget>[
                                                // Harga
                                                Text(
                                                  "Rp ${itemProduct['price']}",
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.red,
                                                  ),
                                                ),

                                                // Icon Hati
                                                GestureDetector(
                                                  onTap: () {
                                                    // Logika favorit
                                                  },
                                                  child: Container(
                                                    padding: const EdgeInsets.all(4),
                                                    decoration: BoxDecoration(
                                                      shape: BoxShape.circle,
                                                      color: Colors.grey[100],
                                                    ),
                                                    child: const Icon(
                                                      Icons.favorite_border,
                                                      color: Colors.red,
                                                      size: 18,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }
                              ),
                          ]
                        ],
                      ),
                    ),
                  ],
        ),
      ),
    );
  }
}