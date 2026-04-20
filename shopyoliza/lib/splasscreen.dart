import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shopyoliza/onboardingpage.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {

  @override
  void initState(){
    super.initState();
    Timer(const Duration(seconds: 3), ()=>Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context)=> const OnBoardingPage())));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children:<Widget> [
                Image.asset('lib/image/shoping.jpeg', scale: 1.2),
                Text(
                  "Yoliza Online Shop",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold, 
                    color: Colors.black
                ),
              ),
            ],
          ),
      ),
    );
  }
}