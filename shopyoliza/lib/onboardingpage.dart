import 'package:flutter/material.dart';
import 'package:shopyoliza/login.dart';

class OnBoardingPage extends StatefulWidget {
  const OnBoardingPage({super.key});

  @override
  State<OnBoardingPage> createState() => _OnBoardingPageState();
}

class _OnBoardingPageState extends State<OnBoardingPage> {

  PageController page = PageController();
  int indexPage = 0;
  List <Map<String, String>> onBoardData = [
    {
      "title":"Yoliza Ecommerce",
      "subTitle":"Welcome to Our Online Shop",
      "image":"https://down-id.img.susercontent.com/file/3e9fabed6248927d719a2d91667de323@resize_w450_nl.webp",
    },
    {
      "title":"Discover Various Products",
      "subTitle":"Explore a wide range of products from trusted vendors",
      "image":"https://down-id.img.susercontent.com/file/id-11134201-7qukz-lf3lf2419r252d@resize_w450_nl.webp",
    },
    {
      "title":"Easy & Secure Shopping",
      "subTitle":"Shop your favorite items quickly and safely anytime",
      "image":"https://down-id.img.susercontent.com/file/id-11134207-7rbk9-m9olwcng7pq3c3@resize_w450_nl.webp"
    },
    {
      "title":"Best Deals for You",
      "subTitle":"Enjoy exclusive discounts and special offers every day",
      "image":"https://down-id.img.susercontent.com/file/id-11134207-7qukx-ljz8glpjnhwn91@resize_w450_nl.webp"
    },
    {
      "title":"Fast Delivery Service",
      "subTitle":"Get your orders delivered right to your doorstep",
      "image":"https://down-id.img.susercontent.com/file/sg-11134201-23010-mvmwjrffgxlv83@resize_w450_nl.webp"
    },
  ];

  @override
  void initState(){
    super.initState();
    page = PageController();
    page.addListener(() {
      setState(() {
        indexPage = page.page?.round() ?? 0;
      });
    });
  }

  @override
  void dispose(){
    page.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children:<Widget> [
          Expanded(
            child: PageView.builder(
              controller: page,
              itemCount: onBoardData.length,
              itemBuilder: (context, index) {
                return onBoardingLayout(title: "${onBoardData[index]["title"]}", subTitle: "${onBoardData[index]["subTitle"]}", image: "${onBoardData[index]["image"]}");
              }
            ),
          ),

          Padding(
            padding: EdgeInsets.all(20),
            child: Row(
              children:<Widget> [
                indexPage == onBoardData.length -1 ? TextButton(
                  onPressed: (){Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context)=> const LoginPage()));}, 
                  child: Text(
                    "Get Started", 
                    style: TextStyle(
                      fontSize: 12, 
                      fontWeight: FontWeight.bold, 
                      color: Colors.grey,
                    ),
                  ),
                )
                : const Text(""),
                Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    onBoardData.length, (index) => Container(
                      margin: EdgeInsets.symmetric(horizontal: 5),
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle, 
                        color: indexPage == index ? Colors.black54: Colors.blueAccent
                      ),
                    ),
                  ),
                ),),

                IconButton(
                  onPressed: () {
                    if(indexPage == onBoardData.length -1) {
                      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context)=> const LoginPage()));
                    } else {
                      page.nextPage(duration: Duration(microseconds: 300), curve: Curves.easeIn);
                    }
                  }, 
                  icon: Icon(Icons.arrow_forward_ios),
                ),

              ],
            ),
          ),

        ],
      ),
    );
  }
}

class onBoardingLayout extends StatelessWidget {
  const onBoardingLayout(
    {required this.title, required this.subTitle, required this.image}
  );
  final String title;
  final String subTitle;
  final String image;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.network(
          image, 
          height: 350, 
          width: 300,
          fit: BoxFit.fill,
        ),

        SizedBox(height: 20,),
        Text(
          title, 
          style: TextStyle(
            fontSize: 25,
            fontWeight: FontWeight.bold, 
            color: Colors.black
          ),
        ),

        Padding(padding: EdgeInsets.symmetric(horizontal: 20),
        child: Text(
          subTitle, 
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold, 
            color: Colors.grey
          ),
        ),
        ),
      ],
    );
  }
}