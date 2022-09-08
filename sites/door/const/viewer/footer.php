</div><div id="emailforms">
            </div>
            <div id="emailformsmask">
            </div>
            
    
        </div>
        <!-- end #global_content -->
        
        
    <div id="ctl00_ContentPlaceHolder_Footer_Omniture_Placement">
    </div>

    <script type="text/javascript">
        ToolTips();
        ChangeArticleUserAction();
        
        function ChangeArticleUserAction()
        {
            if(articleExists("55938") || videoExists("55938"))
            {
                if (gE("UserAction_1") != null) $("#UserAction_1").html("<a class='btn-bookmarks-on' href='/account/my-folders/articles' onclick='DeleteItem(); return false;'>&nbsp;</a>");
                if (gE("UserAction_2") != null) $("#UserAction_2").html("<a class='btn-bookmarks-on' href='/account/my-folders/articles' onclick='DeleteItem(); return false;'>&nbsp;</a>");
            }
            else
            { 
                if (gE("UserAction_1") != null) gE("UserAction_1").innerHTML = '<a class="btn-bookmarks" href="javascript:void(0);" onclick="SaveItem();" rel="nofollow">&nbsp;</a>';
                if (gE("UserAction_2") != null) gE("UserAction_2").innerHTML = '<a class="btn-bookmarks" href="javascript:void(0);" onclick="SaveItem();" rel="nofollow">&nbsp;</a>';
            }
        }
         
        function SaveItem()
        {
           if(!articleExists("55938"))
           {
              var querystring = "Id=55938&ArticleName=Urban Oasis Sweepstakes";
                  querystring += '&DateCreated=8/12/2010&bookmarkSection=article&PathInfo='+ GetPageName(); 
              
                   querystring += '&action=addarticle';        
              
                
               $AJAX.GetForDelegate(UserOptionsDelegate, PersonalizationRoot + "AjaxCalls/My_Options.aspx?" + querystring);
           }
        }
        
        function DeleteItem()
        {
            if (articleExists("55938"))
            {
                RemoveThisarticle("55938", "Urban Oasis Sweepstakes", false);
                FDAccounts.AddOmMyRecent(this, 'removearticle');
            }
        }
    </script>


    <script type="text/javascript">
      var NbMg = null;
      
      var NbMgInit = window.setTimeout(function()
      {
//         $(document).ready(function(){
//            alert("asdf")
//         })
      //alert(document.readyState)
        //if (document.readyState == "complete")
        //{
            window.setTimeout(function()
            {
                CompleteUserAction("http://");
                NbMg = new NearbyManager("closed", "open");
            },3250);
            //window.clearInterval(NbMgInit);
        //}
      },50);

      // master search bar should be set to content.
      //gE("txtSearch").value = "";
      //document.onmousedown = FDS.mH;
      //document.aboutsearchform.txtAboutPageSearch.focus();
      //SwitchSearch('content');
      var template = 4;
      var sectionname = "Buy";
      if (template != 6 && sectionname == "City Guide")
      {
        $("#first").removeClass("selected");
        $('.navigation ul').css('bottom', '0px');
      }
    </script>

    <script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>
    <!-- Place this render call where appropriate -->
    <script type="text/javascript">
               
        function ShareOnTwitter()
        {
           var TweetURL = GetShortURL('http://www.frontdoor.com/buy/urban-oasis-sweepstakes/55938');            
           var TweetText = "Urban Oasis Sweepstakes ";
           if(TweetText.length > 40)
           {
            TweetText = TweetText.substring(0, 40);
           }
           window.open("http://twitter.com/share?via=HGTVFrontDoor&text=" + encodeURIComponent(TweetText) + "&counturl=" + encodeURIComponent('http://www.frontdoor.combuy/urban-oasis-sweepstakes/55938') + "&url=" + encodeURIComponent(TweetURL) ,"TwitterSharewin", "width=600, height=400");      
        }

        $(document).ready(function () {
            //ChangeUserAction
            window.setTimeout(function() {
                ChangeUserAction();
            }, 1000);
            //Facebook like    
            DoFBLike();
            //Google Plusone
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        });
                
        function DoFBLike() { 
            if (template != 6)
            {
                $("#FB_iLike iframe").attr("src", "http://www.facebook.com/widgets/like.php?href=http://fro.do/9rbq32&layout=button_count&show_faces=false&width=80");
            }
            else {
                $("#FB_iLike iframe").attr("src", "http://www.facebook.com/widgets/like.php?href=http://fro.do/9rbq32&layout=standard&show_faces=false&width=322");
            }
        }
    </script>



        

<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->

<footer>
    
    <nav id="bottomNavigation">
    	<ul class="menuRoot">
        	<li class="logo"><a href="http://www.frontdoor.com/"><span alt="HGTV's FrontDoor.com">&nbsp;</span></a></li>
            <li><a href="http://www.frontdoor.com/">Home</a></li>
            <li><a href="http://www.frontdoor.com/buy">Buying</a></li>
            <li><a href="http://www.frontdoor.com/sell">Selling</a></li>
            <li><a href="http://www.frontdoor.com/buy/home-buying-selling-guides-real-estate-advice-tips-tools-resources/54555">Guides &amp; Advice</a></li>
            <li><a href="http://www.frontdoor.com/city-guide">Explore Cities</a></li>
            <li><a href="http://coolhouses.frontdoor.com">Blog</a></li>
            <li><a href="http://www.frontdoor.com/buy/hgtv-real-estate-shows-on-front-door/55758">HGTV Shows</a></li>
            <li><a href="http://www.frontdoor.com/tools">Tools</a></li>
            <li class="last"><a href="http://www.frontdoor.com/profile">For Agents</a></li>
        </ul>
    </nav>
    
    


<div id="searchbardiv">
    
    

<form action="" onsubmit="return false;" name="footersearchform" id="footersearchform">
    <span class="shadow"></span>
    <div class="tabs">
        Search in:
        <a class="for-sale" onclick="SetSearchVariables(event);SwitchSearch('SalesFooter', '', '','False','', 'Unknown');">For Sale<em></em></a>
        <a class="for-rent" onclick="SetSearchVariables(event);SwitchSearch('RentalsFooter', '', '','False','', 'Unknown');">For Rent<span></span><em></em></a>
        <a class="article-videos active">Article &amp; Videos<em></em></a>
        <a class="for-agents" onclick="SetSearchVariables(event);SwitchSearch('AgentFooter', '', '','False','', 'Unknown');">Agents<span></span><em></em></a>
    </div>
    
    <div class="searchbar">
        <div style="position: relative; background: none repeat scroll 0% 0% transparent;">
            <input type="text" maxlength="2048" id="txtSearchGrey" class="greytext" autocomplete="off"/>
            <div id="misspell" class="lst"></div>
        </div>
        <input type="text" id="txtContentSearch" name="txtContentSearch" value="" autocomplete="off" onkeydown="SetSearchVariables(event);ContentKeyDown(event,this, this.form);" onclick="SetSearchVariables(event);if(this.value=='Search for Articles & Videos')this.value='';" onfocus="SetSearchVariables(event);" default_value="Search for Articles & Videos" />
        <a href="javascript:void(0);" class="btn-search" onclick="SetSearchVariables(event);setSearchInteractionCookie('Articles &amp; Videos');DoSearchContentSmall(footersearchform);">Search</a>
        <div id="suggest_position">
            <div id="suggest">
            </div>
        </div>
        <div id="oops_wrapper" class="clearfix" style="display:none">
            <div id="oops_wrapper_top"></div>
            <div id="oops_wrapper_div">
                <h3>Oops!</h3>
                <a href="javascript:void(0);" class="btn-close"></a>
                <div id="oops_text" class="oops_text_search clearfix"></div>
            </div>
            <div id="oops_wrapper_bottom"></div>                         
        </div>
    </div>
    <input type="hidden" id="EndecaId" name="EndecaId" value="" />
    <input type="hidden" id="sb" name="sb" value="" />
</form>



</div>

<script type="text/javascript">
    var sid = "";
    var SearchBarType = "";
    var WebRoot = "http://www.frontdoor.com/";
    var DefaultSalesSearchText = "Search for Address, City, State OR Zip Code";
</script>


   
    <section class="links">
    <span class="shadow"></span>
    <div>
        <h3>FrontDoor Info</h3>
        <a href="http://www.frontdoor.com/buy/about-frontdoor/776">About FrontDoor</a>
        <a href="http://www.frontdoor.com/buy/frequently-asked-questions/56067">Questions</a><!--FAQ-->
        <a href="http://www.frontdoor.com/buy/jobs-at-frontdoor/779">Jobs at FrontDoor</a>
        <!--<a href="http://www.frontdoor.com/Buy/Contact-Us/1375">Contact Us</a>-->
        <!--<a href="http://www.frontdoor.com/Buy/Jobs-at-Frontdoor/779">Jobs at FrontDoor</a>-->
        <a href="http://www.frontdoor.com/buy/press-and-public-releases/1633">Press &amp; PR</a>
        <a href="http://coolhouses.frontdoor.com/" target="_blank">FrontDoor Blog</a>
        <a href="http://www.hgtv.com/on-tv/be-on-hgtv/index.html" target="_blank">Be on HGTV</a>
        <a href="http://mynewsletters.scrippsnetworks.com:8080/subscription/subscribe?brand=fdoor&amp;source=0000_FD_WEBFORM">Real Estate Newsletter</a>
        <a href="http://www.facebook.com/pages/frontdoorcom/18669721826" target="_blank">Fan us on Facebook</a>
        <a href="http://twitter.com/hgtvfrontdoor" target="_blank">Follow us on Twitter</a>
        <a href="http://www.scrippsnetworksdigital.com/frontdoor/default.aspx" target="_blank">Advertise with Us</a>
        <a href="http://www.frontdoor.com/buy/sweepstakes/56396">Sweepstakes</a>
    </div>
    <div>
        <h3>Homes for Sale by City</h3>
        <a href="http://www.frontdoor.com/sitemap">FrontDoor Local Real Estate Listings</a>
        <a href="http://www.frontdoor.com/rent-sitemap">FrontDoor Local Rental Listings</a>
        <a href="http://www.frontdoor.com/for_sale/new-york-ny-usa">New York Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/atlanta-ga-usa">Atlanta Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/las-vegas-nv-usa">Las Vegas Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/orlando-fl-usa">Orlando Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/raleigh-nc-usa">Raleigh Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/santa-fe-nm-usa">Santa Fe Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/san-antonio-tx-usa">San Antonio Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/tampa-fl-usa">Tampa Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/knoxville-tn-usa">Knoxville Real Estate Listings</a>
        <a href="http://www.frontdoor.com/for_sale/san-francisco-ca-usa">San Francisco Real Estate Listings</a>
    </div>
    <div>
        <h3>Real Estate Tools &amp; Guides</h3>
        <a href="http://www.frontdoor.com/tools/calculators/mortgage-calculator.aspx">Mortgage Calculator</a>
        <a href="http://www.frontdoor.com/tools/calculators/can-i-afford-it.aspx">Loan Payments</a>
        <a href="http://www.frontdoor.com/tools/calculators/home-value-lossorgain-tax-estimator.aspx">Home Value Estimator</a>
        <a href="http://www.frontdoor.com/buy/hgtv-frontdoor-widgets/55667">HGTV's FrontDoor Widgets</a>
        <a href="http://www.frontdoor.com/buy/first-time-buyers-guide-find-tips-and-advice-onbuying-your-first-home/1978">First Time Home Buyer Guides</a>
        <a href="http://www.frontdoor.com/sell/home-sellers-guide-tips-for-pricing-preparing-and-promoting-your-home-for-sale/541">Home Seller's Guide</a>
        <a href="http://www.frontdoor.com/move/relocation-guide--tips-and-advice-to-help-you-plan-pack-and-move/959">Moving Guide</a>
        <a href="http://www.frontdoor.com/home-finance/frontdoorcoms-guide-to-home-finance/542">Home Finance Guide</a>
        <a href="http://www.frontdoor.com/home-finance/foreclosure-guide/1012">Foreclosure Guide</a>
        <a href="http://www.frontdoor.com/city-guide/">City Guides</a>
        <a href="http://www.frontdoor.com/agents" title="Real Estate Agents">Find an Agent</a>
    </div>
    <div>
        <h3>Scripps Networks Digital</h3>
        <a href="http://www.hgtv.com/" target="_blank">HGTV</a>
        <a href="http://www.diynetwork.com" target="_blank">DIY Network</a>
        <a href="http://www.hgtvremodels.com" target="_blank">HGTVRemodels.com</a>
        <a href="http://www.foodnetwork.com/" target="_blank">Food Network</a>
        <a href="http://www.cookingchanneltv.com/" target="_blank">Cooking Channel</a>
        <a href="http://www.food.com/" target="_blank">Food.com</a>
        <a href="http://www.cityeats.com/" target="_blank">CityEats.com</a>
        <a href="http://www.travelchannel.com/" target="_blank">Travel Channel</a>
        <a href="http://www.gactv.com/" target="_blank">GAC</a>
    </div>                        
</section>
    
<aside class="copyright">
    <p>
        &copy; <a href="http://www.scrippsnetworks.com/" target="_blank">2011 Scripps Networks, LLC</a>. All rights reserved.
        <a href="http://www.frontdoor.com/buy/privacy-policy/611">Privacy and CA Privacy Rights</a> | 
        <a href="http://dv.privacychoice.org/index.php/preferenceManager/global?company_id=40" target="_blank">Ad Choices</a>
        <a href="http://dv.privacychoice.org/index.php/preferenceManager/global?company_id=40" target="_blank"><img src="http://adimages.scrippsnetworks.com/daaIcon/daaIcon.png" border="0" alt="DAA Icon" class="ad-choices" /></a> |
        <a href="http://www.frontdoor.com/buy/user-agreement/614">Terms of Use</a> |
        <a href="http://www.frontdoor.com/buy/frontdoor-professional-terms-of-use/55936">Pro Terms of Use</a>
    </p>
</aside>
    
</footer>
        
    </div>
    <!-- end #global_wrap -->

    
    
    

<!--Google Code for pageview Conversion Page-->
<script type="text/javascript">
    var google_conversion_id = 1049630529;
    var google_conversion_language = "en_US";
    var google_conversion_format = "1";
    var google_conversion_color = "666666";
    if (1) {
        var google_conversion_value = 1;
    }
    var google_conversion_label = "pageview";
</script>


    
    <script type="text/javascript" src="http://www.googleadservices.com/pagead/conversion.js"></script>

    
    <script type="text/javascript" src="http://icompass.insightexpressai.com/921.js"></script>

    <script type="text/javascript">
        //SuperstitialAd(1);
        SuperstitialAd(2);
        SuperstitialAd(3);
    </script>

    <script type="text/javascript">
        if (!document.readyState)
        {
            document.readyState = "complete";
        }


function ReloadFrameAds()
{
    void(null);
}

    </script>

    <script type="text/javascript">
        setVars();
    </script>

    <script type="text/javascript">
        window.onbeforeunload = function(e) { if (navigator.appName == "Microsoft Internet Explorer") { if (!e) e = window.event; if (e != undefined && e.clientY != undefined && e.clientY <= 0) { if (readCookie("ibs") != null) { var d = new Date(); document.cookie = "ibs=" + readCookie("ibs") + ";expires=" + d.toGMTString() + ";" + ";"; } } } };
    </script>

    
<script type="text/javascript" src="http://static.frontdoor.com/dynamic/includes%2cmasters%2cmain.master%40Undefined%400%40,postResourcePlaceHolder,,2_0_0.js"></script>
<script type="text/javascript" src="http://static.frontdoor.com/dynamic/includes%2cmasters%2cmain.master%40Undefined%400%40,plhFacebook,,2_0_0.js"></script>
    
<!-- Adobe Digital Marketing Suite Tag Management code Copyright 1996-2012 Adobe, Inc. All Rights Reserved More info available at http://www.adobe.com --> 
<script type="text/javascript" src="http://www.frontdoor.com/includes/javascript/s_code_remote.js"></script> 
<script type="text/javascript">
//<![CDATA[
    s.t() 
//]]></script> 
<!-- End Adobe Digital Marketing Suite Tag Management code -->    
</body>

</html>
