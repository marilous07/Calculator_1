/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/LGPL Deployment (2023-09-15)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/
//> @class Media
// Constants and APIs for managing icons and fonts in your application.
// @visibility internal
//<

isc.defineClass("Media", "Class");
isc.Media.addClassMethods({
    
    
    // this array lists the supported stockIconGroups
    stockIconGroups: [],

    addStockIconGroup : function (name, title, metadata, scImgURLPrefix, criteria) {
        if (metadata) {
            // passed array of stockIcon entries - add them now, if not already present
            if (!isc.Media.stockIcons.getProperty("group").getUniqueItems().contains(name)) {
                isc.Media.stockIcons.addList(metadata);
            }
        }
        isc.Media.stockIconGroups.add({ 
            name: name, title: title, 
            metadata: isc.Media.getStockIcons(name), 
            scImgURLPrefix: scImgURLPrefix,
            // this is criteria to filter the stockIcons array
            criteria: criteria || { group: name }
        });
        isc.Media.stockIconGroupsMap = isc.Media.stockIconGroups.makeIndex("name");
        return isc.Media.getStockIconGroup(name);
    },

    // remove a stockIconGroup entry, and its icons
    removeStockIconGroup : function (groupName) {
        var groupIcons = isc.Media.getStockIcons(groupName);
        for (var i=0; i<groupIcons.length; i++) {
            isc.Media.stockIcons.remove(groupIcons[i]);
        }
        var group = isc.Media.stockIconGroupsMap[groupName];
        if (group) isc.Media.stockIconGroups.remove(group);
        group = null;
        isc.Media.stockIconGroupsMap = isc.Media.stockIconGroups.makeIndex("name");
        isc.Media.stockIconsMap = isc.Media.stockIcons.makeIndex("name");
    },
    clearStockIconGroups : function (name) {
        isc.Media.stockIconGroupsMap = {};
        for (var i=isc.Media.stockIconGroups.length-1; i>0; i--) {
            isc.Media.stockIconGroups[i] = null;
            isc.Media.stockIconGroups.remove(i);
        }
        isc.Media.stockIconGroups = [];
    },

    getStockIconGroup : function (name) {
        return isc.Media.stockIconGroupsMap[name];
    },

    getStockIcons : function (group, name) {
        var result;
        if (name) {
            // return the single stockIcon with the passed "name", wrapped in an array, or an 
            // empty array
            result = isc.Media.stockIconsMap[name];
            if (result) result = [result]
            else result = [];
        } else if (group) {
            // return the stockIcons with the passed "group"
            result = isc.Media.stockIcons.findAll("group", group);
        } else {
            // return all the stockIcons
            result = isc.Media.stockIcons;
        }
        return result || [];
    },

    
    getStockIcon : function (value, fieldName) {
        // default fieldName is "name" - so the default call is just getStockIcon("Add"), eg
        fieldName = fieldName || "name";
        if (fieldName == "name") {
            if (isc.Media.stockIconsMap[fieldName]) {
                return isc.addProperties({}, isc.Media.stockIconsMap[value]);
            }
        } 
        // return the stock icon where icon[fieldName]==value
        var map = isc.Media.stockIcons.makeIndex(fieldName);
        if (map[value]) {
            return isc.addProperties({}, map[value]);
        }
        return null;
    },

    removeStockIcon : function (stockKey) {
        isc.Media.removeStockIcons([stockKey]);
    },
    removeStockIcons : function (stockKeys) {
        if (!isc.isAn.Array(stockKeys)) stockKeys = [stockKeys];
        for (var i=0; i<stockKeys.length; i++) {
            if (isc.Media.stockIconsMap[stockKeys[i]]) {
                isc.Media.stockIcons.remove(isc.Media.stockIconsMap[stockKeys[i]]);
                delete isc.Media.stockIconsMap[stockKeys[i]];
            }
        }
    },
    
    setStockIconStates : function (stockKeys, statesArray) {
        if (!isc.isAn.Array(stockKeys)) stockKeys = [stockKeys];
        for (var i=0; i<stockKeys.length; i++) {
            if (isc.Media.stockIconsMap[stockKeys[i]]) {
                var icon = isc.Media.stockIconsMap[stockKeys[i]];
                if (icon) icon.states = statesArray;
            }
        }
    },

    // update the states array on all the icons in the passed group
    setStockIconGroupStates : function (groupKey, statesArray) {
        var icons = isc.Media.getStockIcons(groupKey);
        for (var i=0; i<icons.length; i++) {
            var icon = icons[i];
            if (icon) icon.states = statesArray;
        }
    },

    // internal methods for getting a DS of image-properties for the builtin framework images
    getStockIconDS : function (iconGroup) {
        var group = isc.Media.getStockIconGroup(iconGroup);
        if (!group || !isc.DataSource) return null;
        if (!group.dataSource) {
            group.dataSource = isc.DataSource.create({
                clientOnly: true,
                fields: [
                    { name: "src", type: "text", primaryKey: true },
                    { name: "scImgURL", type: "text" },
                    { name: "name", type: "text" },
                    { name: "state", type: "text" },
                    { name: "width", type: "integer" },
                    { name: "height", type: "integer" }
                ],
                cacheData: group.metadata
            });
        }
        return group.dataSource;
    },
    // helper to get the image URLs for a known standard group - param can currently be one of 
    // "action", "header" or "class"
    getStockIconURLS : function (iconGroup) {
        var icons = isc.Media.getStockIcons(iconGroup);

        // sort the icons by index and name
        icons.setSort([
            { property: "index", direction: "ascending" },
            { property: "name", direction: "ascending" }
        ]);

        var URLs = [];
        // build an array of objects with src and Name attributes
        for (var i=0; i<icons.length; i++) {
            var icon = icons[i];
            URLs.add({ name: icon.name, scImgURL: icon.parsedURL, src: icon.imgURL });
            if (icon.states && icon.states.length > 0) {
                // if the icon has states, add those URLs as well
                var dotIndex = icon.parsedURL.indexOf("."),
                    start = icon.parsedURL.substring(0, dotIndex) + "_",
                    end = icon.parsedURL.substring(dotIndex)
                ;
                
                for (var j=0; j<icon.states.length; j++) {
                    var iSrc = start + icon.states[j] + end;
                    URLs.add({
                        name: icon.name + "_" + icon.states[j], 
                        scImgURL: iSrc,
                        src: isc.Canvas.getImgURL(iSrc),
                        state: icon.states[j]
                    });
                }
            }
        }
        return URLs;
    }
});

isc.Media.addClassProperties({
    iconSets: {
        "skin": "Skin",
        "materialIcons": {
            // this is the regular font - there are four other variants
            cssClass: "material-icons",
            keyList: "10k:e951;10mp:e952;11mp:e953;12mp:e954;13mp:e955;14mp:e956;15mp:e957;16mp:e958;17mp:e959;18mp:e95a;19mp:e95b;1k:e95c;1k_plus:e95d;20mp:e95e;21mp:e95f;22mp:e960;23mp:e961;24mp:e962;2k:e963;2k_plus:e964;2mp:e965;360:e577;3d_rotation:e84d;3k:e966;3k_plus:e967;3mp:e968;4k:e072;4k_plus:e969;4mp:e96a;5g:ef38;5k:e96b;5k_plus:e96c;5mp:e96d;6_ft_apart:f21e;6k:e96e;6k_plus:e96f;6mp:e970;7k:e971;7k_plus:e972;7mp:e973;8k:e974;8k_plus:e975;8mp:e976;9k:e977;9k_plus:e978;9mp:e979;ac_unit:eb3b;access_alarm:e190;access_alarms:e191;access_time:e192;accessibility:e84e;accessibility_new:e92c;accessible:e914;accessible_forward:e934;account_balance:e84f;account_balance_wallet:e850;account_box:e851;account_circle:e853;account_tree:e97a;ad_units:ef39;adb:e60e;add:e145;add_a_photo:e439;add_alarm:e193;add_alert:e003;add_box:e146;add_business:e729;add_call:e0e8;add_chart:e97b;add_circle:e147;add_circle_outline:e148;add_comment:e266;add_ic_call:e97c;add_link:e178;add_location:e567;add_location_alt:ef3a;add_moderator:e97d;add_photo_alternate:e43e;add_road:ef3b;add_shopping_cart:e854;add_task:f23a;add_to_drive:e65c;add_to_home_screen:e1fe;add_to_photos:e39d;add_to_queue:e05c;addchart:ef3c;adjust:e39e;admin_panel_settings:ef3d;agriculture:ea79;airline_seat_flat:e630;airline_seat_flat_angled:e631;airline_seat_individual_suite:e632;airline_seat_legroom_extra:e633;airline_seat_legroom_normal:e634;airline_seat_legroom_reduced:e635;airline_seat_recline_extra:e636;airline_seat_recline_normal:e637;airplanemode_active:e195;airplanemode_inactive:e194;airplanemode_off:e194;airplanemode_on:e195;airplay:e055;airport_shuttle:eb3c;alarm:e855;alarm_add:e856;alarm_off:e857;alarm_on:e858;album:e019;align_horizontal_center:e00f;align_horizontal_left:e00d;align_horizontal_right:e010;align_vertical_bottom:e015;align_vertical_center:e011;align_vertical_top:e00c;all_inbox:e97f;all_inclusive:eb3d;all_out:e90b;alt_route:f184;alternate_email:e0e6;amp_stories:ea13;analytics:ef3e;anchor:f1cd;android:e859;animation:e71c;announcement:e85a;apartment:ea40;api:f1b7;app_blocking:ef3f;app_registration:ef40;app_settings_alt:ef41;approval:e982;apps:e5c3;architecture:ea3b;archive:e149;arrow_back:e5c4;arrow_back_ios:e5e0;arrow_circle_down:f181;arrow_circle_up:f182;arrow_downward:e5db;arrow_drop_down:e5c5;arrow_drop_down_circle:e5c6;arrow_drop_up:e5c7;arrow_forward:e5c8;arrow_forward_ios:e5e1;arrow_left:e5de;arrow_right:e5df;arrow_right_alt:e941;arrow_upward:e5d8;art_track:e060;article:ef42;aspect_ratio:e85b;assessment:e85c;assignment:e85d;assignment_ind:e85e;assignment_late:e85f;assignment_return:e860;assignment_returned:e861;assignment_turned_in:e862;assistant:e39f;assistant_direction:e988;assistant_navigation:e989;assistant_photo:e3a0;atm:e573;attach_email:ea5e;attach_file:e226;attach_money:e227;attachment:e2bc;attractions:ea52;audiotrack:e3a1;auto_awesome:e65f;auto_awesome_mosaic:e660;auto_awesome_motion:e661;auto_delete:ea4c;auto_fix_high:e663;auto_fix_normal:e664;auto_fix_off:e665;auto_stories:e666;autorenew:e863;av_timer:e01b;baby_changing_station:f19b;backpack:f19c;backspace:e14a;backup:e864;backup_table:ef43;badge:ea67;bakery_dining:ea53;ballot:e172;bar_chart:e26b;batch_prediction:f0f5;bathtub:ea41;battery_alert:e19c;battery_charging_full:e1a3;battery_full:e1a4;battery_std:e1a5;battery_unknown:e1a6;beach_access:eb3e;bedtime:ef44;beenhere:e52d;bento:f1f4;bike_scooter:ef45;biotech:ea3a;block:e14b;block_flipped:ef46;bluetooth:e1a7;bluetooth_audio:e60f;bluetooth_connected:e1a8;bluetooth_disabled:e1a9;bluetooth_searching:e1aa;blur_circular:e3a2;blur_linear:e3a3;blur_off:e3a4;blur_on:e3a5;bolt:ea0b;book:e865;book_online:f217;bookmark:e866;bookmark_border:e867;bookmark_outline:e867;bookmarks:e98b;border_all:e228;border_bottom:e229;border_clear:e22a;border_color:e22b;border_horizontal:e22c;border_inner:e22d;border_left:e22e;border_outer:e22f;border_right:e230;border_style:e231;border_top:e232;border_vertical:e233;branding_watermark:e06b;breakfast_dining:ea54;brightness_1:e3a6;brightness_2:e3a7;brightness_3:e3a8;brightness_4:e3a9;brightness_5:e3aa;brightness_6:e3ab;brightness_7:e3ac;brightness_auto:e1ab;brightness_high:e1ac;brightness_low:e1ad;brightness_medium:e1ae;broken_image:e3ad;browser_not_supported:ef47;brunch_dining:ea73;brush:e3ae;bubble_chart:e6dd;bug_report:e868;build:e869;build_circle:ef48;burst_mode:e43c;bus_alert:e98f;business:e0af;business_center:eb3f;cached:e86a;cake:e7e9;calculate:ea5f;calendar_today:e935;calendar_view_day:e936;call:e0b0;call_end:e0b1;call_made:e0b2;call_merge:e0b3;call_missed:e0b4;call_missed_outgoing:e0e4;call_received:e0b5;call_split:e0b6;call_to_action:e06c;camera:e3af;camera_alt:e3b0;camera_enhance:e8fc;camera_front:e3b1;camera_rear:e3b2;camera_roll:e3b3;campaign:ef49;cancel:e5c9;cancel_presentation:e0e9;cancel_schedule_send:ea39;car_rental:ea55;car_repair:ea56;card_giftcard:e8f6;card_membership:e8f7;card_travel:e8f8;carpenter:f1f8;cases:e992;casino:eb40;cast:e307;cast_connected:e308;cast_for_education:efec;category:e574;celebration:ea65;cell_wifi:e0ec;center_focus_strong:e3b4;center_focus_weak:e3b5;change_history:e86b;charging_station:f19d;chat:e0b7;chat_bubble:e0ca;chat_bubble_outline:e0cb;check:e5ca;check_box:e834;check_box_outline_blank:e835;check_circle:e86c;check_circle_outline:e92d;checkroom:f19e;chevron_left:e5cb;chevron_right:e5cc;child_care:eb41;child_friendly:eb42;chrome_reader_mode:e86d;circle:ef4a;circle_notifications:e994;class:e86e;clean_hands:f21f;cleaning_services:f0ff;clear:e14c;clear_all:e0b8;close:e5cd;close_fullscreen:f1cf;closed_caption:e01c;closed_caption_disabled:f1dc;closed_caption_off:e996;cloud:e2bd;cloud_circle:e2be;cloud_done:e2bf;cloud_download:e2c0;cloud_off:e2c1;cloud_queue:e2c2;cloud_upload:e2c3;code:e86f;collections:e3b6;collections_bookmark:e431;color_lens:e3b7;colorize:e3b8;comment:e0b9;comment_bank:ea4e;commute:e940;compare:e3b9;compare_arrows:e915;compass_calibration:e57c;compress:e94d;computer:e30a;confirmation_num:e638;confirmation_number:e638;connect_without_contact:f223;connected_tv:e998;construction:ea3c;contact_mail:e0d0;contact_page:f22e;contact_phone:e0cf;contact_support:e94c;contactless:ea71;contacts:e0ba;content_copy:e14d;content_cut:e14e;content_paste:e14f;control_camera:e074;control_point:e3ba;control_point_duplicate:e3bb;copyright:e90c;coronavirus:f221;corporate_fare:f1d0;countertops:f1f7;create:e150;create_new_folder:e2cc;credit_card:e870;crop:e3be;crop_16_9:e3bc;crop_3_2:e3bd;crop_5_4:e3bf;crop_7_5:e3c0;crop_din:e3c1;crop_free:e3c2;crop_landscape:e3c3;crop_original:e3c4;crop_portrait:e3c5;crop_rotate:e437;crop_square:e3c6;dangerous:e99a;dashboard:e871;dashboard_customize:e99b;data_usage:e1af;date_range:e916;deck:ea42;dehaze:e3c7;delete:e872;delete_forever:e92b;delete_outline:e92e;delete_sweep:e16c;delivery_dining:ea72;departure_board:e576;description:e873;design_services:f10a;desktop_access_disabled:e99d;desktop_mac:e30b;desktop_windows:e30c;details:e3c8;developer_board:e30d;developer_mode:e1b0;device_hub:e335;device_thermostat:e1ff;device_unknown:e339;devices:e1b1;devices_other:e337;dialer_sip:e0bb;dialpad:e0bc;dinner_dining:ea57;directions:e52e;directions_bike:e52f;directions_boat:e532;directions_bus:e530;directions_car:e531;directions_ferry:e532;directions_off:f10f;directions_railway:e534;directions_run:e566;directions_subway:e533;directions_train:e534;directions_transit:e535;directions_walk:e536;dirty_lens:ef4b;disabled_by_default:f230;disc_full:e610;dnd_forwardslash:e611;dns:e875;do_not_disturb:e612;do_not_disturb_alt:e611;do_not_disturb_off:e643;do_not_disturb_on:e644;do_not_step:f19f;do_not_touch:f1b0;dock:e30e;domain:e7ee;domain_disabled:e0ef;domain_verification:ef4c;done:e876;done_all:e877;done_outline:e92f;donut_large:e917;donut_small:e918;double_arrow:ea50;drafts:e151;drag_handle:e25d;drag_indicator:e945;drive_eta:e613;drive_file_move:e675;drive_file_move_outline:e9a1;drive_file_rename_outline:e9a2;drive_folder_upload:e9a3;dry:f1b3;dry_cleaning:ea58;duo:e9a5;dvr:e1b2;dynamic_feed:ea14;dynamic_form:f1bf;east:f1df;eco:ea35;edit:e3c9;edit_attributes:e578;edit_location:e568;edit_off:e950;edit_road:ef4d;eject:e8fb;elderly:f21a;electric_bike:eb1b;electric_car:eb1c;electric_moped:eb1d;electric_rickshaw:eb1e;electric_scooter:eb1f;electrical_services:f102;elevator:f1a0;email:e0be;emoji_emotions:ea22;emoji_events:ea23;emoji_flags:ea1a;emoji_food_beverage:ea1b;emoji_nature:ea1c;emoji_objects:ea24;emoji_people:ea1d;emoji_symbols:ea1e;emoji_transportation:ea1f;engineering:ea3d;enhance_photo_translate:e8fc;enhanced_encryption:e63f;equalizer:e01d;error:e000;error_outline:e001;escalator:f1a1;escalator_warning:f1ac;euro:ea15;euro_symbol:e926;ev_station:e56d;event:e878;event_available:e614;event_busy:e615;event_note:e616;event_seat:e903;exit_to_app:e879;expand:e94f;expand_less:e5ce;expand_more:e5cf;explicit:e01e;explore:e87a;explore_off:e9a8;exposure:e3ca;exposure_minus_1:e3cb;exposure_minus_2:e3cc;exposure_neg_1:e3cb;exposure_neg_2:e3cc;exposure_plus_1:e3cd;exposure_plus_2:e3ce;exposure_zero:e3cf;extension:e87b;face:e87c;face_retouching_natural:ef4e;facebook:f234;fact_check:f0c5;family_restroom:f1a2;fast_forward:e01f;fast_rewind:e020;fastfood:e57a;favorite:e87d;favorite_border:e87e;favorite_outline:e87e;featured_play_list:e06d;featured_video:e06e;feedback:e87f;fence:f1f6;festival:ea68;fiber_dvr:e05d;fiber_manual_record:e061;fiber_new:e05e;fiber_pin:e06a;fiber_smart_record:e062;file_copy:e173;file_download:e2c4;file_download_done:e9aa;file_present:ea0e;file_upload:e2c6;filter:e3d3;filter_1:e3d0;filter_2:e3d1;filter_3:e3d2;filter_4:e3d4;filter_5:e3d5;filter_6:e3d6;filter_7:e3d7;filter_8:e3d8;filter_9:e3d9;filter_9_plus:e3da;filter_alt:ef4f;filter_b_and_w:e3db;filter_center_focus:e3dc;filter_drama:e3dd;filter_frames:e3de;filter_hdr:e3df;filter_list:e152;filter_list_alt:e94e;filter_none:e3e0;filter_tilt_shift:e3e2;filter_vintage:e3e3;find_in_page:e880;find_replace:e881;fingerprint:e90d;fire_extinguisher:f1d8;fire_hydrant:f1a3;fireplace:ea43;first_page:e5dc;fit_screen:ea10;fitness_center:eb43;flag:e153;flaky:ef50;flare:e3e4;flash_auto:e3e5;flash_off:e3e6;flash_on:e3e7;flight:e539;flight_land:e904;flight_takeoff:e905;flip:e3e8;flip_camera_android:ea37;flip_camera_ios:ea38;flip_to_back:e882;flip_to_front:e883;folder:e2c7;folder_open:e2c8;folder_shared:e2c9;folder_special:e617;follow_the_signs:f222;font_download:e167;food_bank:f1f2;format_align_center:e234;format_align_justify:e235;format_align_left:e236;format_align_right:e237;format_bold:e238;format_clear:e239;format_color_fill:e23a;format_color_reset:e23b;format_color_text:e23c;format_indent_decrease:e23d;format_indent_increase:e23e;format_italic:e23f;format_line_spacing:e240;format_list_bulleted:e241;format_list_numbered:e242;format_list_numbered_rtl:e267;format_paint:e243;format_quote:e244;format_shapes:e25e;format_size:e245;format_strikethrough:e246;format_textdirection_l_to_r:e247;format_textdirection_r_to_l:e248;format_underline:e249;format_underlined:e249;forum:e0bf;forward:e154;forward_10:e056;forward_30:e057;forward_5:e058;forward_to_inbox:f187;foundation:f200;free_breakfast:eb44;fullscreen:e5d0;fullscreen_exit:e5d1;functions:e24a;g_translate:e927;gamepad:e30f;games:e021;gavel:e90e;gesture:e155;get_app:e884;gif:e908;goat:10fffd;golf_course:eb45;gps_fixed:e1b3;gps_not_fixed:e1b4;gps_off:e1b5;grade:e885;gradient:e3e9;grading:ea4f;grain:e3ea;graphic_eq:e1b8;grass:f205;grid_off:e3eb;grid_on:e3ec;grid_view:e9b0;group:e7ef;group_add:e7f0;group_work:e886;groups:f233;hail:e9b1;handyman:f10b;hardware:ea59;hd:e052;hdr_enhanced_select:ef51;hdr_off:e3ed;hdr_on:e3ee;hdr_strong:e3f1;hdr_weak:e3f2;headset:e310;headset_mic:e311;headset_off:e33a;healing:e3f3;hearing:e023;hearing_disabled:f104;height:ea16;help:e887;help_center:f1c0;help_outline:e8fd;high_quality:e024;highlight:e25f;highlight_alt:ef52;highlight_off:e888;highlight_remove:e888;history:e889;history_edu:ea3e;history_toggle_off:f17d;home:e88a;home_filled:e9b2;home_repair_service:f100;home_work:ea09;horizontal_distribute:e014;horizontal_rule:f108;horizontal_split:e947;hot_tub:eb46;hotel:e53a;hourglass_bottom:ea5c;hourglass_disabled:ef53;hourglass_empty:e88b;hourglass_full:e88c;hourglass_top:ea5b;house:ea44;house_siding:f202;how_to_reg:e174;how_to_vote:e175;http:e902;https:e88d;hvac:f10e;icecream:ea69;image:e3f4;image_aspect_ratio:e3f5;image_not_supported:f116;image_search:e43f;imagesearch_roller:e9b4;import_contacts:e0e0;import_export:e0c3;important_devices:e912;inbox:e156;indeterminate_check_box:e909;info:e88e;info_outline:e88f;input:e890;insert_chart:e24b;insert_chart_outlined:e26a;insert_comment:e24c;insert_drive_file:e24d;insert_emoticon:e24e;insert_invitation:e24f;insert_link:e250;insert_photo:e251;insights:f092;integration_instructions:ef54;inventory:e179;invert_colors:e891;invert_colors_off:e0c4;invert_colors_on:e891;ios_share:e6b8;iso:e3f6;keyboard:e312;keyboard_arrow_down:e313;keyboard_arrow_left:e314;keyboard_arrow_right:e315;keyboard_arrow_up:e316;keyboard_backspace:e317;keyboard_capslock:e318;keyboard_control:e5d3;keyboard_hide:e31a;keyboard_return:e31b;keyboard_tab:e31c;keyboard_voice:e31d;king_bed:ea45;kitchen:eb47;label:e892;label_important:e937;label_important_outline:e948;label_off:e9b6;label_outline:e893;landscape:e3f7;language:e894;laptop:e31e;laptop_chromebook:e31f;laptop_mac:e320;laptop_windows:e321;last_page:e5dd;launch:e895;layers:e53b;layers_clear:e53c;leaderboard:f20c;leak_add:e3f8;leak_remove:e3f9;leave_bags_at_home:f21b;legend_toggle:f11b;lens:e3fa;library_add:e02e;library_add_check:e9b7;library_books:e02f;library_music:e030;lightbulb:e0f0;lightbulb_outline:e90f;line_style:e919;line_weight:e91a;linear_scale:e260;link:e157;link_off:e16f;linked_camera:e438;liquor:ea60;list:e896;list_alt:e0ee;live_help:e0c6;live_tv:e639;local_activity:e53f;local_airport:e53d;local_atm:e53e;local_attraction:e53f;local_bar:e540;local_cafe:e541;local_car_wash:e542;local_convenience_store:e543;local_dining:e556;local_drink:e544;local_fire_department:ef55;local_florist:e545;local_gas_station:e546;local_grocery_store:e547;local_hospital:e548;local_hotel:e549;local_laundry_service:e54a;local_library:e54b;local_mall:e54c;local_movies:e54d;local_offer:e54e;local_parking:e54f;local_pharmacy:e550;local_phone:e551;local_pizza:e552;local_play:e553;local_police:ef56;local_post_office:e554;local_print_shop:e555;local_printshop:e555;local_restaurant:e556;local_see:e557;local_shipping:e558;local_taxi:e559;location_city:e7f1;location_disabled:e1b6;location_history:e55a;location_off:e0c7;location_on:e0c8;location_pin:f1db;location_searching:e1b7;lock:e897;lock_clock:ef57;lock_open:e898;lock_outline:e899;login:ea77;logout:e9ba;looks:e3fc;looks_3:e3fb;looks_4:e3fd;looks_5:e3fe;looks_6:e3ff;looks_one:e400;looks_two:e401;loop:e028;loupe:e402;low_priority:e16d;loyalty:e89a;luggage:f235;lunch_dining:ea61;mail:e158;mail_outline:e0e1;map:e55b;maps_ugc:ef58;margin:e9bb;mark_as_unread:e9bc;mark_chat_read:f18b;mark_chat_unread:f189;mark_email_read:f18c;mark_email_unread:f18a;markunread:e159;markunread_mailbox:e89b;masks:f218;maximize:e930;mediation:efa7;medical_services:f109;meeting_room:eb4f;memory:e322;menu:e5d2;menu_book:ea19;menu_open:e9bd;merge_type:e252;message:e0c9;messenger:e0ca;messenger_outline:e0cb;mic:e029;mic_external_off:ef59;mic_external_on:ef5a;mic_none:e02a;mic_off:e02b;microwave:f204;military_tech:ea3f;minimize:e931;miscellaneous_services:f10c;missed_video_call:e073;mms:e618;mobile_friendly:e200;mobile_off:e201;mobile_screen_share:e0e7;mode_comment:e253;mode_edit:e254;model_training:f0cf;monetization_on:e263;money:e57d;money_off:e25c;monitor:ef5b;monochrome_photos:e403;mood:e7f2;mood_bad:e7f3;moped:eb28;more:e619;more_horiz:e5d3;more_time:ea5d;more_vert:e5d4;motion_photos_off:e9c0;motion_photos_on:e9c1;motion_photos_pause:f227;motion_photos_paused:e9c2;motorcycle:e91b;mouse:e323;move_to_inbox:e168;movie:e02c;movie_creation:e404;movie_filter:e43a;mp:e9c3;multiline_chart:e6df;multiple_stop:f1b9;multitrack_audio:e1b8;museum:ea36;music_note:e405;music_off:e440;music_video:e063;my_library_add:e02e;my_library_books:e02f;my_library_music:e030;my_location:e55c;nat:ef5c;nature:e406;nature_people:e407;navigate_before:e408;navigate_next:e409;navigation:e55d;near_me:e569;near_me_disabled:f1ef;network_cell:e1b9;network_check:e640;network_locked:e61a;network_wifi:e1ba;new_releases:e031;next_plan:ef5d;next_week:e16a;nfc:e1bb;night_shelter:f1f1;nightlife:ea62;nightlight_round:ef5e;nights_stay:ea46;no_backpack:f237;no_cell:f1a4;no_drinks:f1a5;no_encryption:e641;no_flash:f1a6;no_food:f1a7;no_luggage:f23b;no_meals:f1d6;no_meals_ouline:f229;no_meeting_room:eb4e;no_photography:f1a8;no_sim:e0cc;no_stroller:f1af;no_transfer:f1d5;north:f1e0;north_east:f1e1;north_west:f1e2;not_accessible:f0fe;not_interested:e033;not_listed_location:e575;not_started:f0d1;note:e06f;note_add:e89c;notes:e26c;notification_important:e004;notifications:e7f4;notifications_active:e7f7;notifications_none:e7f5;notifications_off:e7f6;notifications_on:e7f7;notifications_paused:e7f8;now_wallpaper:e1bc;now_widgets:e1bd;offline_bolt:e932;offline_pin:e90a;offline_share:e9c5;ondemand_video:e63a;online_prediction:f0eb;opacity:e91c;open_in_browser:e89d;open_in_full:f1ce;open_in_new:e89e;open_with:e89f;outbond:f228;outbox:ef5f;outdoor_grill:ea47;outgoing_mail:f0d2;outlet:f1d4;outlined_flag:e16e;padding:e9c8;pages:e7f9;pageview:e8a0;palette:e40a;pan_tool:e925;panorama:e40b;panorama_fish_eye:e40c;panorama_fisheye:e40c;panorama_horizontal:e40d;panorama_horizontal_select:ef60;panorama_photosphere:e9c9;panorama_photosphere_select:e9ca;panorama_vertical:e40e;panorama_vertical_select:ef61;panorama_wide_angle:e40f;panorama_wide_angle_select:ef62;park:ea63;party_mode:e7fa;pause:e034;pause_circle_filled:e035;pause_circle_outline:e036;pause_presentation:e0ea;payment:e8a1;payments:ef63;pedal_bike:eb29;pending:ef64;pending_actions:f1bb;people:e7fb;people_alt:ea21;people_outline:e7fc;perm_camera_mic:e8a2;perm_contact_cal:e8a3;perm_contact_calendar:e8a3;perm_data_setting:e8a4;perm_device_info:e8a5;perm_device_information:e8a5;perm_identity:e8a6;perm_media:e8a7;perm_phone_msg:e8a8;perm_scan_wifi:e8a9;person:e7fd;person_add:e7fe;person_add_alt:ea4d;person_add_alt_1:ef65;person_add_disabled:e9cb;person_outline:e7ff;person_pin:e55a;person_pin_circle:e56a;person_remove:ef66;person_remove_alt_1:ef67;person_search:f106;personal_video:e63b;pest_control:f0fa;pest_control_rodent:f0fd;pets:e91d;phone:e0cd;phone_android:e324;phone_bluetooth_speaker:e61b;phone_callback:e649;phone_disabled:e9cc;phone_enabled:e9cd;phone_forwarded:e61c;phone_in_talk:e61d;phone_iphone:e325;phone_locked:e61e;phone_missed:e61f;phone_paused:e620;phonelink:e326;phonelink_erase:e0db;phonelink_lock:e0dc;phonelink_off:e327;phonelink_ring:e0dd;phonelink_setup:e0de;photo:e410;photo_album:e411;photo_camera:e412;photo_camera_back:ef68;photo_camera_front:ef69;photo_filter:e43b;photo_library:e413;photo_size_select_actual:e432;photo_size_select_large:e433;photo_size_select_small:e434;picture_as_pdf:e415;picture_in_picture:e8aa;picture_in_picture_alt:e911;pie_chart:e6c4;pie_chart_outlined:e6c5;pin_drop:e55e;pivot_table_chart:e9ce;place:e55f;plagiarism:ea5a;play_arrow:e037;play_circle_fill:e038;play_circle_filled:e038;play_circle_outline:e039;play_disabled:ef6a;play_for_work:e906;playlist_add:e03b;playlist_add_check:e065;playlist_play:e05f;plumbing:f107;plus_one:e800;point_of_sale:f17e;policy:ea17;poll:e801;polymer:e8ab;pool:eb48;portable_wifi_off:e0ce;portrait:e416;post_add:ea20;power:e63c;power_input:e336;power_off:e646;power_settings_new:e8ac;pregnant_woman:e91e;present_to_all:e0df;preview:f1c5;print:e8ad;print_disabled:e9cf;priority_high:e645;privacy_tip:f0dc;psychology:ea4a;public:e80b;public_off:f1ca;publish:e255;published_with_changes:f232;push_pin:f10d;qr_code:ef6b;qr_code_2:e00a;qr_code_scanner:f206;query_builder:e8ae;question_answer:e8af;queue:e03c;queue_music:e03d;queue_play_next:e066;quick_contacts_dialer:e0cf;quick_contacts_mail:e0d0;quickreply:ef6c;radio:e03e;radio_button_checked:e837;radio_button_off:e836;radio_button_on:e837;radio_button_unchecked:e836;railway_alert:e9d1;ramen_dining:ea64;rate_review:e560;read_more:ef6d;receipt:e8b0;receipt_long:ef6e;recent_actors:e03f;recommend:e9d2;record_voice_over:e91f;redeem:e8b1;redo:e15a;reduce_capacity:f21c;refresh:e5d5;remove:e15b;remove_circle:e15c;remove_circle_outline:e15d;remove_done:e9d3;remove_from_queue:e067;remove_moderator:e9d4;remove_red_eye:e417;remove_shopping_cart:e928;reorder:e8fe;repeat:e040;repeat_on:e9d6;repeat_one:e041;repeat_one_on:e9d7;replay:e042;replay_10:e059;replay_30:e05a;replay_5:e05b;replay_circle_filled:e9d8;reply:e15e;reply_all:e15f;report:e160;report_off:e170;report_problem:e8b2;request_page:f22c;request_quote:f1b6;reset_tv:e9d9;restaurant:e56c;restaurant_menu:e561;restore:e8b3;restore_from_trash:e938;restore_page:e929;rice_bowl:f1f5;ring_volume:e0d1;roofing:f201;room:e8b4;room_preferences:f1b8;room_service:eb49;rotate_90_degrees_ccw:e418;rotate_left:e419;rotate_right:e41a;rounded_corner:e920;router:e328;rowing:e921;rss_feed:e0e5;rtt:e9ad;rule:f1c2;rule_folder:f1c9;run_circle:ef6f;rv_hookup:e642;sanitizer:f21d;satellite:e562;save:e161;save_alt:e171;saved_search:ea11;scanner:e329;scatter_plot:e268;schedule:e8b5;schedule_send:ea0a;school:e80c;science:ea4b;score:e269;screen_lock_landscape:e1be;screen_lock_portrait:e1bf;screen_lock_rotation:e1c0;screen_rotation:e1c1;screen_search_desktop:ef70;screen_share:e0e2;sd:e9dd;sd_card:e623;sd_storage:e1c2;search:e8b6;search_off:ea76;security:e32a;segment:e94b;select_all:e162;self_improvement:ea78;send:e163;send_and_archive:ea0c;send_to_mobile:f05c;sensor_door:f1b5;sensor_window:f1b4;sentiment_dissatisfied:e811;sentiment_neutral:e812;sentiment_satisfied:e813;sentiment_satisfied_alt:e0ed;sentiment_very_dissatisfied:e814;sentiment_very_satisfied:e815;set_meal:f1ea;settings:e8b8;settings_applications:e8b9;settings_backup_restore:e8ba;settings_bluetooth:e8bb;settings_brightness:e8bd;settings_cell:e8bc;settings_display:e8bd;settings_ethernet:e8be;settings_input_antenna:e8bf;settings_input_component:e8c0;settings_input_composite:e8c1;settings_input_hdmi:e8c2;settings_input_svideo:e8c3;settings_overscan:e8c4;settings_phone:e8c5;settings_power:e8c6;settings_remote:e8c7;settings_system_daydream:e1c3;settings_voice:e8c8;share:e80d;shield:e9e0;shop:e8c9;shop_two:e8ca;shopping_bag:f1cc;shopping_basket:e8cb;shopping_cart:e8cc;short_text:e261;show_chart:e6e1;shuffle:e043;shuffle_on:e9e1;shutter_speed:e43d;sick:f220;signal_cellular_0_bar:f0a8;signal_cellular_4_bar:e1c8;signal_cellular_alt:e202;signal_cellular_connected_no_internet_4_bar:e1cd;signal_cellular_no_sim:e1ce;signal_cellular_null:e1cf;signal_cellular_off:e1d0;signal_wifi_0_bar:f0b0;signal_wifi_4_bar:e1d8;signal_wifi_4_bar_lock:e1d9;signal_wifi_off:e1da;sim_card:e32b;sim_card_alert:e624;single_bed:ea48;skip_next:e044;skip_previous:e045;slideshow:e41b;slow_motion_video:e068;smart_button:f1c1;smartphone:e32c;smoke_free:eb4a;smoking_rooms:eb4b;sms:e625;sms_failed:e626;snippet_folder:f1c7;snooze:e046;soap:f1b2;sort:e164;sort_by_alpha:e053;source:f1c4;south:f1e3;south_east:f1e4;south_west:f1e5;spa:eb4c;space_bar:e256;speaker:e32d;speaker_group:e32e;speaker_notes:e8cd;speaker_notes_off:e92a;speaker_phone:e0d2;speed:e9e4;spellcheck:e8ce;sports:ea30;sports_bar:f1f3;sports_baseball:ea51;sports_basketball:ea26;sports_cricket:ea27;sports_esports:ea28;sports_football:ea29;sports_golf:ea2a;sports_handball:ea33;sports_hockey:ea2b;sports_kabaddi:ea34;sports_mma:ea2c;sports_motorsports:ea2d;sports_rugby:ea2e;sports_soccer:ea2f;sports_tennis:ea32;sports_volleyball:ea31;square_foot:ea49;stacked_bar_chart:e9e6;stacked_line_chart:f22b;stairs:f1a9;star:e838;star_border:e83a;star_half:e839;star_outline:e83a;star_outline:f06f;star_rate:f0ec;stars:e8d0;stay_current_landscape:e0d3;stay_current_portrait:e0d4;stay_primary_landscape:e0d5;stay_primary_portrait:e0d6;sticky_note_2:f1fc;stop:e047;stop_circle:ef71;stop_screen_share:e0e3;storage:e1db;store:e8d1;store_mall_directory:e563;storefront:ea12;straighten:e41c;stream:e9e9;streetview:e56e;strikethrough_s:e257;stroller:f1ae;style:e41d;subdirectory_arrow_left:e5d9;subdirectory_arrow_right:e5da;subject:e8d2;subscript:f111;subscriptions:e064;subtitles:e048;subtitles_off:ef72;subway:e56f;superscript:f112;supervised_user_circle:e939;supervisor_account:e8d3;support:ef73;support_agent:f0e2;surround_sound:e049;swap_calls:e0d7;swap_horiz:e8d4;swap_horizontal_circle:e933;swap_vert:e8d5;swap_vert_circle:e8d6;swap_vertical_circle:e8d6;swipe:e9ec;switch_account:e9ed;switch_camera:e41e;switch_left:f1d1;switch_right:f1d2;switch_video:e41f;sync:e627;sync_alt:ea18;sync_disabled:e628;sync_problem:e629;system_update:e62a;system_update_alt:e8d7;system_update_tv:e8d7;tab:e8d8;tab_unselected:e8d9;table_chart:e265;table_rows:f101;table_view:f1be;tablet:e32f;tablet_android:e330;tablet_mac:e331;tag:e9ef;tag_faces:e420;takeout_dining:ea74;tap_and_play:e62b;tapas:f1e9;taxi_alert:ef74;terrain:e564;text_fields:e262;text_format:e165;text_rotate_up:e93a;text_rotate_vertical:e93b;text_rotation_angledown:e93c;text_rotation_angleup:e93d;text_rotation_down:e93e;text_rotation_none:e93f;text_snippet:f1c6;textsms:e0d8;texture:e421;theater_comedy:ea66;theaters:e8da;thumb_down:e8db;thumb_down_alt:e816;thumb_down_off_alt:e9f2;thumb_up:e8dc;thumb_up_alt:e817;thumb_up_off_alt:e9f3;thumbs_up_down:e8dd;time_to_leave:e62c;timelapse:e422;timeline:e922;timer:e425;timer_10:e423;timer_3:e424;timer_off:e426;title:e264;toc:e8de;today:e8df;toggle_off:e9f5;toggle_on:e9f6;toll:e8e0;tonality:e427;topic:f1c8;touch_app:e913;tour:ef75;toys:e332;track_changes:e8e1;traffic:e565;train:e570;tram:e571;transfer_within_a_station:e572;transform:e428;transit_enterexit:e579;translate:e8e2;trending_down:e8e3;trending_flat:e8e4;trending_neutral:e8e4;trending_up:e8e5;trip_origin:e57b;tty:f1aa;tune:e429;turned_in:e8e6;turned_in_not:e8e7;tv:e333;tv_off:e647;two_wheeler:e9f9;umbrella:f1ad;unarchive:e169;undo:e166;unfold_less:e5d6;unfold_more:e5d7;unpublished:f236;unsubscribe:e0eb;update:e923;update_disabled:e075;upgrade:f0fb;upload_file:e9fc;usb:e1e0;verified:ef76;verified_user:e8e8;vertical_align_bottom:e258;vertical_align_center:e259;vertical_align_top:e25a;vertical_distribute:e076;vertical_split:e949;vibration:e62d;video_call:e070;video_collection:e04a;video_label:e071;video_library:e04a;video_settings:ea75;videocam:e04b;videocam_off:e04c;videogame_asset:e338;view_agenda:e8e9;view_array:e8ea;view_carousel:e8eb;view_column:e8ec;view_comfortable:e42a;view_comfy:e42a;view_compact:e42b;view_day:e8ed;view_headline:e8ee;view_in_ar:e9fe;view_list:e8ef;view_module:e8f0;view_quilt:e8f1;view_sidebar:f114;view_stream:e8f2;view_week:e8f3;vignette:e435;visibility:e8f4;visibility_off:e8f5;voice_chat:e62e;voice_over_off:e94a;voicemail:e0d9;volume_down:e04d;volume_mute:e04e;volume_off:e04f;volume_up:e050;volunteer_activism:ea70;vpn_key:e0da;vpn_lock:e62f;wallet_giftcard:e8f6;wallet_membership:e8f7;wallet_travel:e8f8;wallpaper:e1bc;warning:e002;wash:f1b1;watch:e334;watch_later:e924;water_damage:f203;waterfall_chart:ea00;waves:e176;wb_auto:e42c;wb_cloudy:e42d;wb_incandescent:e42e;wb_iridescent:e436;wb_shade:ea01;wb_sunny:e430;wb_twighlight:ea02;wc:e63d;web:e051;web_asset:e069;weekend:e16b;west:f1e6;whatshot:e80e;wheelchair_pickup:f1ab;where_to_vote:e177;widgets:e1bd;wifi:e63e;wifi_calling:ef77;wifi_lock:e1e1;wifi_off:e648;wifi_protected_setup:f0fc;wifi_tethering:e1e2;wine_bar:f1e8;work:e8f9;work_off:e942;work_outline:e943;workspaces_filled:ea0d;workspaces_outline:ea0f;wrap_text:e25b;wrong_location:ef78;wysiwyg:f1c3;youtube_searched_for:e8fa;zoom_in:e8ff;zoom_out:e900;zoom_out_map:e56b",
            iconMap : {
                // actions
                Accept: 'check', // new
                Add: 'add',
                Approve: 'check',
                Auto_fit: 'auto_fix_normal',
                Auto_fit_all: 'auto_fix_high',
                Back: 'arrow_back',
                Cancel: 'cancel',
                Clear_sort: 'verified',
                ClearFilter: 'filter_none', // new
                Close: 'close',
                Color_swatch: 'palette',
                Column_preferences: 'view_column',
                Configure: 'settings',
                Configure_sort: 'sort_by_alpha',
                Download: 'file_download',
                Drag: 'drag_indicator',
                Dynamic: 'dynamic_feed',
                Edit: 'edit',
                Exclamation: 'warning',
                Export: 'import_export', // new
                Filter: 'filter_list',
                FilterActive: 'filter_alt',  // new
                First: 'first_page',
                Forward: 'arrow_forward',
                FreezeLeft: 'border_left',
                FreezeRight: 'border_right',
                Groupby: 'workspaces_filled',
                Help: 'help',
                Last: 'last_page',
                Next: 'navigate_next',
                Ok: 'check',
                Plus: 'add',  // new
                Prev: 'navigate_before',
                Print: 'print',  // new
                Redo: 'redo',
                Refresh: 'autorenew',
                Remove: 'remove',
                Save: 'save',
                Search: 'search',
                Sort_ascending: 'arrow_upward',
                Sort_descending: 'arrow_downward',
                Text_linespacing: 'format_line_spacing',  // new
                Undo: 'undo',
                Unfreeze: 'border_clear',
                Ungroup: 'workspaces_outline',
                View: 'pageview',
                View_rtl: 'preview',
                // tree
                Tree_leaf: 'file_present',
                Tree_folder: 'folder',
                Tree_folderclosed: 'folder',
                Tree_folderdrop: 'folder_special',
                Tree_folderfile: 'snippet_folder',
                Tree_folderloading: 'drive_folder_upload',
                Tree_folderopened: 'folder_open',
                Tree_opener_closed: 'add',
                Tree_opener_opened: 'remove'
            }
        },
        "materialIconsOutline": {
            cssClass: "material-icons-outlined",
            keyList: "360:e577;3d_rotation:e84d;4k:e072;5g:ef38;6_ft_apart:f21e;ac_unit:eb3b;access_alarm:e190;access_alarms:e191;access_time:e192;accessibility:e84e;accessibility_new:e92c;accessible:e914;accessible_forward:e934;account_balance:e84f;account_balance_wallet:e850;account_box:e851;account_circle:e853;account_tree:e97a;ad_units:ef39;adb:e60e;add:e145;add_a_photo:e439;add_alarm:e193;add_alert:e003;add_box:e146;add_business:e729;add_circle:e147;add_circle_outline:e148;add_comment:e266;add_ic_call:e97c;add_location:e567;add_location_alt:ef3a;add_photo_alternate:e43e;add_road:ef3b;add_shopping_cart:e854;add_task:f23a;add_to_home_screen:e1fe;add_to_photos:e39d;add_to_queue:e05c;addchart:ef3c;adjust:e39e;admin_panel_settings:ef3d;agriculture:ea79;airline_seat_flat:e630;airline_seat_flat_angled:e631;airline_seat_individual_suite:e632;airline_seat_legroom_extra:e633;airline_seat_legroom_normal:e634;airline_seat_legroom_reduced:e635;airline_seat_recline_extra:e636;airline_seat_recline_normal:e637;airplanemode_active:e195;airplanemode_inactive:e194;airplanemode_off:e194;airplanemode_on:e195;airplay:e055;airport_shuttle:eb3c;alarm:e855;alarm_add:e856;alarm_off:e857;alarm_on:e858;album:e019;align_horizontal_center:e00f;align_horizontal_left:e00d;align_horizontal_right:e010;align_vertical_bottom:e015;align_vertical_center:e011;align_vertical_top:e00c;all_inbox:e97f;all_inclusive:eb3d;all_out:e90b;alt_route:f184;alternate_email:e0e6;amp_stories:ea13;analytics:ef3e;anchor:f1cd;android:e859;announcement:e85a;apartment:ea40;api:f1b7;app_blocking:ef3f;app_settings_alt:ef41;apps:e5c3;architecture:ea3b;archive:e149;arrow_back:e5c4;arrow_back_ios:e5e0;arrow_circle_down:f181;arrow_circle_up:f182;arrow_downward:e5db;arrow_drop_down:e5c5;arrow_drop_down_circle:e5c6;arrow_drop_up:e5c7;arrow_forward:e5c8;arrow_forward_ios:e5e1;arrow_left:e5de;arrow_right:e5df;arrow_right_alt:e941;arrow_upward:e5d8;art_track:e060;article:ef42;aspect_ratio:e85b;assessment:e85c;assignment:e85d;assignment_ind:e85e;assignment_late:e85f;assignment_return:e860;assignment_returned:e861;assignment_turned_in:e862;assistant:e39f;assistant_photo:e3a0;atm:e573;attach_email:ea5e;attach_file:e226;attach_money:e227;attachment:e2bc;attribution:efdb;audiotrack:e3a1;auto_delete:ea4c;autorenew:e863;av_timer:e01b;baby_changing_station:f19b;backpack:f19c;backspace:e14a;backup:e864;backup_table:ef43;ballot:e172;bar_chart:e26b;batch_prediction:f0f5;bathtub:ea41;battery_alert:e19c;battery_charging_full:e1a3;battery_full:e1a4;battery_std:e1a5;battery_unknown:e1a6;beach_access:eb3e;bedtime:ef44;beenhere:e52d;bento:f1f4;bike_scooter:ef45;biotech:ea3a;block:e14b;bluetooth:e1a7;bluetooth_audio:e60f;bluetooth_connected:e1a8;bluetooth_disabled:e1a9;bluetooth_searching:e1aa;blur_circular:e3a2;blur_linear:e3a3;blur_off:e3a4;blur_on:e3a5;book:e865;book_online:f217;bookmark:e866;bookmark_border:e867;bookmark_outline:e867;bookmarks:e98b;border_all:e228;border_bottom:e229;border_clear:e22a;border_horizontal:e22c;border_inner:e22d;border_left:e22e;border_outer:e22f;border_right:e230;border_style:e231;border_top:e232;border_vertical:e233;branding_watermark:e06b;brightness_1:e3a6;brightness_2:e3a7;brightness_3:e3a8;brightness_4:e3a9;brightness_5:e3aa;brightness_6:e3ab;brightness_7:e3ac;brightness_auto:e1ab;brightness_high:e1ac;brightness_low:e1ad;brightness_medium:e1ae;broken_image:e3ad;browser_not_supported:ef47;brush:e3ae;bubble_chart:e6dd;bug_report:e868;build:e869;build_circle:ef48;burst_mode:e43c;business:e0af;business_center:eb3f;cached:e86a;cake:e7e9;calculate:ea5f;calendar_today:e935;calendar_view_day:e936;call:e0b0;call_end:e0b1;call_made:e0b2;call_merge:e0b3;call_missed:e0b4;call_missed_outgoing:e0e4;call_received:e0b5;call_split:e0b6;call_to_action:e06c;camera:e3af;camera_alt:e3b0;camera_enhance:e8fc;camera_front:e3b1;camera_rear:e3b2;camera_roll:e3b3;campaign:ef49;cancel:e5c9;cancel_presentation:e0e9;cancel_schedule_send:ea39;card_giftcard:e8f6;card_membership:e8f7;card_travel:e8f8;carpenter:f1f8;casino:eb40;cast:e307;cast_connected:e308;cast_for_education:efec;category:e574;center_focus_strong:e3b4;center_focus_weak:e3b5;change_history:e86b;charging_station:f19d;chat:e0b7;chat_bubble:e0ca;chat_bubble_outline:e0cb;check:e5ca;check_box:e834;check_box_outline_blank:e835;check_circle:e86c;check_circle_outline:e92d;checkroom:f19e;chevron_left:e5cb;chevron_right:e5cc;child_care:eb41;child_friendly:eb42;chrome_reader_mode:e86d;class:e86e;clean_hands:f21f;cleaning_services:f0ff;clear:e14c;clear_all:e0b8;close:e5cd;close_fullscreen:f1cf;closed_caption:e01c;closed_caption_disabled:f1dc;cloud:e2bd;cloud_circle:e2be;cloud_done:e2bf;cloud_download:e2c0;cloud_off:e2c1;cloud_queue:e2c2;cloud_upload:e2c3;code:e86f;collections:e3b6;collections_bookmark:e431;color_lens:e3b7;colorize:e3b8;comment:e0b9;comment_bank:ea4e;commute:e940;compare:e3b9;compare_arrows:e915;compass_calibration:e57c;computer:e30a;confirmation_num:e638;confirmation_number:e638;connect_without_contact:f223;construction:ea3c;contact_mail:e0d0;contact_page:f22e;contact_phone:e0cf;contact_support:e94c;contactless:ea71;contacts:e0ba;content_copy:f08a;content_cut:f08b;content_paste:f098;control_camera:e074;control_point:e3ba;control_point_duplicate:e3bb;copy:f08a;copyright:e90c;coronavirus:f221;corporate_fare:f1d0;countertops:f1f7;create:e150;create_new_folder:e2cc;credit_card:e870;crop:e3be;crop_16_9:e3bc;crop_3_2:e3bd;crop_5_4:e3bf;crop_7_5:e3c0;crop_din:e3c1;crop_free:e3c2;crop_landscape:e3c3;crop_original:e3c4;crop_portrait:e3c5;crop_rotate:e437;crop_square:e3c6;cut:f08b;dashboard:e871;data_usage:e1af;date_range:e916;deck:ea42;dehaze:e3c7;delete:e872;delete_forever:e92b;delete_outline:e92e;delete_sweep:e16c;departure_board:e576;description:e873;design_services:f10a;desktop_access_disabled:e99d;desktop_mac:e30b;desktop_windows:e30c;details:e3c8;developer_board:e30d;developer_mode:e1b0;device_hub:e335;device_unknown:e339;devices:e1b1;devices_other:e337;dialer_sip:e0bb;dialpad:e0bc;directions:e52e;directions_bike:e52f;directions_boat:e532;directions_bus:e530;directions_car:e531;directions_ferry:e532;directions_off:f10f;directions_railway:e534;directions_run:e566;directions_subway:e533;directions_train:e534;directions_transit:e535;directions_walk:e536;disabled_by_default:f230;disc_full:e610;dns:e875;do_disturb:f08c;do_disturb_alt:f08d;do_disturb_off:f08e;do_disturb_on:f08f;do_not_step:f19f;do_not_touch:f1b0;dock:e30e;domain:e7ee;domain_disabled:e0ef;domain_verification:ef4c;done:e876;done_all:e877;done_outline:e92f;donut_large:e917;donut_small:e918;double_arrow:ea50;download:f090;download_done:f091;drafts:e151;drag_handle:e25d;drag_indicator:e945;drive_eta:e613;dry:f1b3;duo:e9a5;dvr:e1b2;dynamic_feed:ea14;dynamic_form:f1bf;east:f1df;eco:ea35;edit:e3c9;edit_attributes:e578;edit_location:e568;edit_road:ef4d;eject:e8fb;elderly:f21a;electric_bike:eb1b;electric_car:eb1c;electric_moped:eb1d;electric_scooter:eb1f;electrical_services:f102;elevator:f1a0;email:e0be;emoji_emotions:ea22;emoji_events:ea23;emoji_flags:ea1a;emoji_food_beverage:ea1b;emoji_nature:ea1c;emoji_objects:ea24;emoji_people:ea1d;emoji_symbols:ea1e;emoji_transportation:ea1f;engineering:ea3d;enhance_photo_translate:e8fc;enhanced_encryption:e63f;equalizer:e01d;error:e000;error_outline:e001;escalator:f1a1;escalator_warning:f1ac;euro:ea15;euro_symbol:e926;ev_station:e56d;event:e878;event_available:e614;event_busy:e615;event_note:e616;event_seat:e903;exit_to_app:e879;expand_less:e5ce;expand_more:e5cf;explicit:e01e;explore:e87a;explore_off:e9a8;exposure:e3ca;exposure_minus_1:e3cb;exposure_minus_2:e3cc;exposure_neg_1:e3cb;exposure_neg_2:e3cc;exposure_plus_1:e3cd;exposure_plus_2:e3ce;exposure_zero:e3cf;extension:e87b;face:e87c;face_unlock:f008;facebook:f234;fact_check:f0c5;family_restroom:f1a2;fast_forward:e01f;fast_rewind:e020;fastfood:e57a;favorite:e87d;favorite_border:e87e;favorite_outline:e87e;featured_play_list:e06d;featured_video:e06e;feedback:e87f;fence:f1f6;fiber_dvr:e05d;fiber_manual_record:e061;fiber_new:e05e;fiber_pin:e06a;fiber_smart_record:e062;file_copy:e173;filter:e3d3;filter_1:e3d0;filter_2:e3d1;filter_3:e3d2;filter_4:e3d4;filter_5:e3d5;filter_6:e3d6;filter_7:e3d7;filter_8:e3d8;filter_9:e3d9;filter_9_plus:e3da;filter_alt:ef4f;filter_b_and_w:e3db;filter_center_focus:e3dc;filter_drama:e3dd;filter_frames:e3de;filter_hdr:e3df;filter_list:e152;filter_none:e3e0;filter_tilt_shift:e3e2;filter_vintage:e3e3;find_in_page:e880;find_replace:e881;fingerprint:e90d;fire_extinguisher:f1d8;fireplace:ea43;first_page:e5dc;fitness_center:eb43;flag:e153;flaky:ef50;flare:e3e4;flash_auto:e3e5;flash_off:e3e6;flash_on:e3e7;flight:e539;flight_land:e904;flight_takeoff:e905;flip:e3e8;flip_camera_android:ea37;flip_camera_ios:ea38;flip_to_back:e882;flip_to_front:e883;folder:e2c7;folder_open:e2c8;folder_shared:e2c9;folder_special:e617;follow_the_signs:f222;font_download:e167;food_bank:f1f2;format_align_center:e234;format_align_justify:e235;format_align_left:e236;format_align_right:e237;format_bold:e238;format_clear:e239;format_color_reset:e23b;format_indent_decrease:e23d;format_indent_increase:e23e;format_italic:e23f;format_line_spacing:e240;format_list_bulleted:e241;format_list_numbered:e242;format_list_numbered_rtl:e267;format_paint:e243;format_quote:e244;format_shapes:e25e;format_size:e245;format_strikethrough:e246;format_textdirection_l_to_r:e247;format_textdirection_r_to_l:e248;format_underline:e249;format_underlined:e249;forum:e0bf;forward:e154;forward_10:e056;forward_30:e057;forward_5:e058;forward_to_inbox:f187;foundation:f200;free_breakfast:eb44;fullscreen:e5d0;fullscreen_exit:e5d1;functions:e24a;g_translate:e927;gamepad:e30f;games:e021;gavel:e90e;gesture:e155;get_app:e884;gif:e908;golf_course:eb45;gps_fixed:e1b3;gps_not_fixed:e1b4;gps_off:e1b5;grade:e885;gradient:e3e9;grading:ea4f;grain:e3ea;graphic_eq:e1b8;grass:f205;grid_off:e3eb;grid_on:e3ec;group:e7ef;group_add:e7f0;group_work:e886;groups:f233;handyman:f10b;hd:e052;hdr_off:e3ed;hdr_on:e3ee;hdr_strong:e3f1;hdr_weak:e3f2;headset:e310;headset_mic:e311;healing:e3f3;hearing:e023;hearing_disabled:f104;height:ea16;help:e887;help_center:f1c0;help_outline:e8fd;high_quality:e024;highlight:e25f;highlight_alt:ef52;highlight_off:e888;highlight_remove:e888;history:e889;history_edu:ea3e;history_toggle_off:f17d;home:e88a;home_repair_service:f100;home_work:ea09;horizontal_distribute:e014;horizontal_rule:f108;horizontal_split:e947;hot_tub:eb46;hotel:e53a;hourglass_bottom:ea5c;hourglass_disabled:ef53;hourglass_empty:e88b;hourglass_full:e88c;hourglass_top:ea5b;house:ea44;house_siding:f202;how_to_reg:e174;how_to_vote:e175;http:e902;https:e88d;hvac:f10e;image:e3f4;image_aspect_ratio:e3f5;image_not_supported:f116;image_search:e43f;import_contacts:e0e0;import_export:e0c3;important_devices:e912;inbox:e156;indeterminate_check_box:e909;info:e88e;input:e890;insert_chart:e24b;insert_chart_outlined:e26a;insert_comment:e24c;insert_drive_file:e24d;insert_emoticon:e24e;insert_invitation:e24f;insert_link:e250;insert_photo:e251;insights:f092;integration_instructions:ef54;invert_colors:e891;invert_colors_off:e0c4;invert_colors_on:e891;iso:e3f6;keyboard:e312;keyboard_arrow_down:e313;keyboard_arrow_left:e314;keyboard_arrow_right:e315;keyboard_arrow_up:e316;keyboard_backspace:e317;keyboard_capslock:e318;keyboard_control:e5d3;keyboard_hide:e31a;keyboard_return:e31b;keyboard_tab:e31c;keyboard_voice:e31d;king_bed:ea45;kitchen:eb47;label:e892;label_important:e937;label_off:e9b6;landscape:e3f7;language:e894;laptop:e31e;laptop_chromebook:e31f;laptop_mac:e320;laptop_windows:e321;last_page:e5dd;launch:e895;layers:e53b;layers_clear:e53c;leaderboard:f20c;leak_add:e3f8;leak_remove:e3f9;leave_bags_at_home:f23b;legend_toggle:f11b;lens:e3fa;library_add:e02e;library_add_check:e9b7;library_books:e02f;library_music:e030;lightbulb:e0f0;line_style:e919;line_weight:e91a;linear_scale:e260;link:e157;link_off:e16f;linked_camera:e438;list:e896;list_alt:e0ee;live_help:e0c6;live_tv:e639;local_activity:e53f;local_airport:e53d;local_atm:e53e;local_attraction:e53f;local_bar:e540;local_cafe:e541;local_car_wash:e542;local_convenience_store:e543;local_dining:e556;local_drink:e544;local_fire_department:ef55;local_florist:e545;local_gas_station:e546;local_grocery_store:e547;local_hospital:e548;local_hotel:e549;local_laundry_service:e54a;local_library:e54b;local_mall:e54c;local_movies:e54d;local_offer:e54e;local_parking:e54f;local_pharmacy:e550;local_phone:e551;local_pizza:e552;local_play:e553;local_police:ef56;local_post_office:e554;local_print_shop:e555;local_printshop:e555;local_restaurant:e556;local_see:e557;local_shipping:e558;local_taxi:e559;location_city:e7f1;location_disabled:e1b6;location_history:e55a;location_off:e0c7;location_on:e0c8;location_searching:e1b7;lock:e897;lock_open:e898;login:ea77;looks:e3fc;looks_3:e3fb;looks_4:e3fd;looks_5:e3fe;looks_6:e3ff;looks_one:e400;looks_two:e401;loop:e028;loupe:e402;low_priority:e16d;loyalty:e89a;luggage:f235;mail:e158;mail_outline:e0e1;map:e55b;maps_ugc:ef58;mark_chat_read:f18b;mark_chat_unread:f189;mark_email_read:f18c;mark_email_unread:f18a;markunread:e159;markunread_mailbox:e89b;masks:f218;maximize:e930;mediation:efa7;medical_services:f109;meeting_room:eb4f;memory:e322;menu:e5d2;menu_book:ea19;menu_open:e9bd;merge_type:e252;message:e0c9;messenger:e0ca;messenger_outline:e0cb;mic:e029;mic_none:e02a;mic_off:e02b;microwave:f204;military_tech:ea3f;minimize:e931;miscellaneous_services:f10c;missed_video_call:e073;mms:e618;mobile_friendly:e200;mobile_off:e201;mobile_screen_share:e0e7;mode:f097;mode_comment:e253;model_training:f0cf;monetization_on:e263;money:e57d;money_off:e25c;money_off_csred:f038;monochrome_photos:e403;mood:e7f2;mood_bad:e7f3;moped:eb28;more:e619;more_horiz:e5d3;more_time:ea5d;more_vert:e5d4;motion_photos_on:e9c1;motion_photos_pause:f227;motion_photos_paused:e9c2;motorcycle:e91b;mouse:e323;move_to_inbox:e168;movie:e02c;movie_creation:e404;movie_filter:e43a;multiline_chart:e6df;multiple_stop:f1b9;multitrack_audio:e1b8;museum:ea36;music_note:e405;music_off:e440;music_video:e063;my_library_add:e02e;my_library_books:e02f;my_library_music:e030;my_location:e55c;nat:ef5c;nature:e406;nature_people:e407;navigate_before:e408;navigate_next:e409;navigation:e55d;near_me:e569;near_me_disabled:f1ef;network_check:e640;network_locked:e61a;new_releases:e031;next_plan:ef5d;next_week:e16a;nfc:e1bb;night_shelter:f1f1;nights_stay:ea46;no_backpack:f237;no_cell:f1a4;no_drinks:f1a5;no_encryption:e641;no_encryption_gmailerrorred:f03f;no_flash:f1a6;no_food:f1a7;no_luggage:f23b;no_meals:f1d6;no_meeting_room:eb4e;no_photography:f1a8;no_sim:e0cc;no_stroller:f1af;no_transfer:f1d5;north:f1e0;north_east:f1e1;north_west:f1e2;not_accessible:f0fe;not_interested:e033;not_listed_location:e575;not_started:f0d1;note:e06f;note_add:e89c;notes:e26c;notification_important:e004;notifications:e7f4;notifications_active:e7f7;notifications_none:e7f5;notifications_off:e7f6;notifications_on:e7f7;notifications_paused:e7f8;now_wallpaper:e1bc;now_widgets:e1bd;offline_bolt:e932;offline_pin:e90a;ondemand_video:e63a;online_prediction:f0eb;opacity:e91c;open_in_browser:e89d;open_in_full:f1ce;open_in_new:e89e;open_with:e89f;outbond:f228;outdoor_grill:ea47;outlet:f1d4;outlined_flag:e16e;pages:e7f9;pageview:e8a0;palette:e40a;pan_tool:e925;panorama:e40b;panorama_fish_eye:e40c;panorama_fisheye:e40c;panorama_horizontal:e40d;panorama_vertical:e40e;panorama_wide_angle:e40f;party_mode:e7fa;paste:f098;pause:e034;pause_circle_filled:e035;pause_circle_outline:e036;pause_presentation:e0ea;payment:e8a1;payments:ef63;pedal_bike:eb29;pending:ef64;pending_actions:f1bb;people:e7fb;people_alt:ea21;people_outline:e7fc;perm_camera_mic:e8a2;perm_contact_cal:e8a3;perm_contact_calendar:e8a3;perm_data_setting:e8a4;perm_device_info:e8a5;perm_device_information:e8a5;perm_identity:e8a6;perm_media:e8a7;perm_phone_msg:e8a8;perm_scan_wifi:e8a9;person:e7fd;person_add:e7fe;person_add_alt_1:ef65;person_add_disabled:e9cb;person_outline:e7ff;person_pin:e55a;person_pin_circle:e56a;person_remove:ef66;person_remove_alt_1:ef67;person_search:f106;personal_video:e63b;pest_control:f0fa;pest_control_rodent:f0fd;pets:e91d;phone:e0cd;phone_android:e324;phone_bluetooth_speaker:e61b;phone_callback:e649;phone_disabled:e9cc;phone_enabled:e9cd;phone_forwarded:e61c;phone_in_talk:e61d;phone_iphone:e325;phone_locked:e61e;phone_missed:e61f;phone_paused:e620;phonelink:e326;phonelink_erase:e0db;phonelink_lock:e0dc;phonelink_off:e327;phonelink_ring:e0dd;phonelink_setup:e0de;photo:e410;photo_album:e411;photo_camera:e412;photo_filter:e43b;photo_library:e413;photo_size_select_actual:e432;photo_size_select_large:e433;photo_size_select_small:e434;picture_as_pdf:e415;picture_in_picture:e8aa;picture_in_picture_alt:e911;pie_chart:e6c4;pie_chart_outline:f044;pin_drop:e55e;place:e55f;plagiarism:ea5a;play_arrow:e037;play_circle_fill:e038;play_circle_filled:e038;play_circle_outline:e039;play_for_work:e906;playlist_add:e03b;playlist_add_check:e065;playlist_play:e05f;plumbing:f107;plus_one:e800;point_of_sale:f17e;policy:ea17;poll:e801;polymer:e8ab;pool:eb48;portable_wifi_off:e0ce;portrait:e416;post_add:ea20;power:e63c;power_input:e336;power_off:e646;power_settings_new:e8ac;precision_manufacturing:f049;pregnant_woman:e91e;present_to_all:e0df;preview:f1c5;print:e8ad;print_disabled:e9cf;priority_high:e645;privacy_tip:f0dc;psychology:ea4a;public:e80b;public_off:f1ca;publish:e255;published_with_changes:f232;push_pin:f10d;qr_code:ef6b;qr_code_2:e00a;qr_code_scanner:f206;query_builder:e8ae;question_answer:e8af;queue:e03c;queue_music:e03d;queue_play_next:e066;quick_contacts_dialer:e0cf;quick_contacts_mail:e0d0;quickreply:ef6c;radio:e03e;radio_button_checked:e837;radio_button_off:e836;radio_button_on:e837;radio_button_unchecked:e836;rate_review:e560;read_more:ef6d;receipt:e8b0;receipt_long:ef6e;recent_actors:e03f;record_voice_over:e91f;redeem:e8b1;redo:e15a;reduce_capacity:f21c;refresh:e5d5;remove:e15b;remove_circle:e15c;remove_circle_outline:e15d;remove_from_queue:e067;remove_red_eye:e417;remove_shopping_cart:e928;reorder:e8fe;repeat:e040;repeat_one:e041;replay:e042;replay_10:e059;replay_30:e05a;replay_5:e05b;reply:e15e;reply_all:e15f;report:e160;report_gmailerrorred:f052;report_off:e170;report_problem:e8b2;request_page:f22c;request_quote:f1b6;restaurant:e56c;restaurant_menu:e561;restore:e8b3;restore_from_trash:e938;restore_page:e929;rice_bowl:f1f5;ring_volume:e0d1;roofing:f201;room:e8b4;room_preferences:f1b8;room_service:eb49;rotate_90_degrees_ccw:e418;rotate_left:e419;rotate_right:e41a;rounded_corner:e920;router:e328;rowing:e921;rss_feed:e0e5;rule:f1c2;rule_folder:f1c9;run_circle:ef6f;rv_hookup:e642;sanitizer:f21d;satellite:e562;save:e161;save_alt:e171;scanner:e329;scatter_plot:e268;schedule:e8b5;school:e80c;science:ea4b;score:e269;screen_lock_landscape:e1be;screen_lock_portrait:e1bf;screen_lock_rotation:e1c0;screen_rotation:e1c1;screen_share:e0e2;sd_card:e623;sd_card_alert:f057;sd_storage:e1c2;search:e8b6;search_off:ea76;security:e32a;select_all:e162;self_improvement:ea78;send:e163;sensor_door:f1b5;sensor_window:f1b4;sentiment_dissatisfied:e811;sentiment_neutral:e812;sentiment_satisfied:e813;sentiment_satisfied_alt:e0ed;sentiment_very_dissatisfied:e814;sentiment_very_satisfied:e815;set_meal:f1ea;settings:e8b8;settings_applications:e8b9;settings_backup_restore:e8ba;settings_bluetooth:e8bb;settings_brightness:e8bd;settings_cell:e8bc;settings_display:e8bd;settings_ethernet:e8be;settings_input_antenna:e8bf;settings_input_component:e8c0;settings_input_composite:e8c1;settings_input_hdmi:e8c2;settings_input_svideo:e8c3;settings_overscan:e8c4;settings_phone:e8c5;settings_power:e8c6;settings_remote:e8c7;settings_system_daydream:e1c3;settings_voice:e8c8;share:e80d;shop:e8c9;shop_two:e8ca;shopping_bag:f1cc;shopping_basket:e8cb;shopping_cart:e8cc;short_text:e261;show_chart:e6e1;shuffle:e043;shutter_speed:e43d;sick:f220;signal_cellular_4_bar:e1c8;signal_cellular_alt:e202;signal_cellular_connected_no_internet_4_bar:e1cd;signal_cellular_no_sim:e1ce;signal_cellular_null:e1cf;signal_cellular_off:e1d0;signal_wifi_4_bar:e1d8;signal_wifi_4_bar_lock:e1d9;signal_wifi_off:e1da;sim_card:e32b;single_bed:ea48;skip_next:e044;skip_previous:e045;slideshow:e41b;slow_motion_video:e068;smart_button:f1c1;smartphone:e32c;smoke_free:eb4a;smoking_rooms:eb4b;sms:e625;sms_failed:e626;snippet_folder:f1c7;snooze:e046;soap:f1b2;sort:e164;sort_by_alpha:e053;source:f1c4;south:f1e3;south_east:f1e4;south_west:f1e5;spa:eb4c;space_bar:e256;speaker:e32d;speaker_group:e32e;speaker_notes:e8cd;speaker_notes_off:e92a;speaker_phone:e0d2;speed:e9e4;spellcheck:e8ce;sports:ea30;sports_bar:f1f3;sports_baseball:ea51;sports_basketball:ea26;sports_cricket:ea27;sports_esports:ea28;sports_football:ea29;sports_golf:ea2a;sports_handball:ea33;sports_hockey:ea2b;sports_kabaddi:ea34;sports_mma:ea2c;sports_motorsports:ea2d;sports_rugby:ea2e;sports_soccer:ea2f;sports_tennis:ea32;sports_volleyball:ea31;square_foot:ea49;stacked_line_chart:f22b;stairs:f1a9;star:e838;star_border:e83a;star_border_purple500:f099;star_half:e839;star_outline:f06f;star_purple500:f09a;star_rate:f0ec;stars:e8d0;stay_current_landscape:e0d3;stay_current_portrait:e0d4;stay_primary_landscape:e0d5;stay_primary_portrait:e0d6;sticky_note_2:f1fc;stop:e047;stop_circle:ef71;stop_screen_share:e0e3;storage:e1db;store:e8d1;store_mall_directory:e563;storefront:ea12;straighten:e41c;streetview:e56e;strikethrough_s:e257;stroller:f1ae;style:e41d;subdirectory_arrow_left:e5d9;subdirectory_arrow_right:e5da;subject:e8d2;subscript:f111;subscriptions:e064;subtitles:e048;subtitles_off:ef72;subway:e56f;superscript:f112;supervised_user_circle:e939;supervisor_account:e8d3;support:ef73;support_agent:f0e2;surround_sound:e049;swap_calls:e0d7;swap_horiz:e8d4;swap_horizontal_circle:e933;swap_vert:e8d5;swap_vert_circle:e8d6;swap_vertical_circle:e8d6;switch_camera:e41e;switch_left:f1d1;switch_right:f1d2;switch_video:e41f;sync:e627;sync_alt:ea18;sync_disabled:e628;sync_problem:e629;system_update:e62a;system_update_alt:e8d7;system_update_tv:e8d7;tab:e8d8;tab_unselected:e8d9;table_chart:e265;table_rows:f101;table_view:f1be;tablet:e32f;tablet_android:e330;tablet_mac:e331;tag_faces:e420;tap_and_play:e62b;tapas:f1e9;terrain:e564;text_fields:e262;text_format:e165;text_rotate_up:e93a;text_rotate_vertical:e93b;text_rotation_angledown:e93c;text_rotation_angleup:e93d;text_rotation_down:e93e;text_rotation_none:e93f;text_snippet:f1c6;textsms:e0d8;texture:e421;theaters:e8da;thermostat:f076;thumb_down:e8db;thumb_down_alt:e816;thumb_up:e8dc;thumb_up_alt:e817;thumbs_up_down:e8dd;time_to_leave:e62c;timelapse:e422;timeline:e922;timer:e425;timer_10:e423;timer_3:e424;timer_off:e426;title:e264;toc:e8de;today:e8df;toggle_off:e9f5;toggle_on:e9f6;toll:e8e0;tonality:e427;topic:f1c8;touch_app:e913;tour:ef75;toys:e332;track_changes:e8e1;traffic:e565;train:e570;tram:e571;transfer_within_a_station:e572;transform:e428;transit_enterexit:e579;translate:e8e2;trending_down:e8e3;trending_flat:e8e4;trending_neutral:e8e4;trending_up:e8e5;trip_origin:e57b;tty:f1aa;tune:e429;turned_in:e8e6;turned_in_not:e8e7;tv:e333;tv_off:e647;two_wheeler:e9f9;umbrella:f1ad;unarchive:e169;undo:e166;unfold_less:e5d6;unfold_more:e5d7;unpublished:f236;unsubscribe:e0eb;update:e923;update_disabled:e075;upgrade:f0fb;upload:f09b;usb:e1e0;verified:ef76;verified_user:e8e8;vertical_align_bottom:e258;vertical_align_center:e259;vertical_align_top:e25a;vertical_distribute:e076;vertical_split:e949;vibration:e62d;video_call:e070;video_collection:e04a;video_label:e071;video_library:e04a;video_settings:ea75;videocam:e04b;videocam_off:e04c;videogame_asset:e338;view_agenda:e8e9;view_array:e8ea;view_carousel:e8eb;view_column:e8ec;view_comfortable:e42a;view_comfy:e42a;view_compact:e42b;view_day:e8ed;view_headline:e8ee;view_list:e8ef;view_module:e8f0;view_quilt:e8f1;view_sidebar:f114;view_stream:e8f2;view_week:e8f3;vignette:e435;visibility:e8f4;visibility_off:e8f5;voice_chat:e62e;voice_over_off:e94a;voicemail:e0d9;volume_down:e04d;volume_mute:e04e;volume_off:e04f;volume_up:e050;vpn_key:e0da;vpn_lock:e62f;wallet_giftcard:e8f6;wallet_membership:e8f7;wallet_travel:e8f8;wallpaper:e1bc;warning:e002;warning_amber:f083;wash:f1b1;watch:e334;watch_later:e924;water_damage:f203;waves:e176;wb_auto:e42c;wb_cloudy:e42d;wb_incandescent:e42e;wb_iridescent:e436;wb_sunny:e430;wc:e63d;web:e051;web_asset:e069;weekend:e16b;west:f1e6;whatshot:e80e;wheelchair_pickup:f1ab;where_to_vote:e177;widgets:e1bd;wifi:e63e;wifi_calling:ef77;wifi_lock:e1e1;wifi_off:e648;wifi_protected_setup:f0fc;wifi_tethering:e1e2;wine_bar:f1e8;work:e8f9;work_off:e942;work_outline:e943;wrap_text:e25b;wrong_location:ef78;wysiwyg:f1c3;youtube_searched_for:e8fa;zoom_in:e8ff;zoom_out:e900;zoom_out_map:e56b"
        },
        "materialIconsSharp": {
            cssClass: "material-icons-sharp",
            keyList: "360:e577;3d_rotation:e84d;4k:e072;5g:ef38;6_ft_apart:f21e;ac_unit:eb3b;access_alarm:e190;access_alarms:e191;access_time:e192;accessibility:e84e;accessibility_new:e92c;accessible:e914;accessible_forward:e934;account_balance:e84f;account_balance_wallet:e850;account_box:e851;account_circle:e853;account_tree:e97a;ad_units:ef39;adb:e60e;add:e145;add_a_photo:e439;add_alarm:e193;add_alert:e003;add_box:e146;add_business:e729;add_circle:e147;add_circle_outline:e148;add_comment:e266;add_ic_call:e97c;add_location:e567;add_location_alt:ef3a;add_photo_alternate:e43e;add_road:ef3b;add_shopping_cart:e854;add_task:f23a;add_to_home_screen:e1fe;add_to_photos:e39d;add_to_queue:e05c;addchart:ef3c;adjust:e39e;admin_panel_settings:ef3d;agriculture:ea79;airline_seat_flat:e630;airline_seat_flat_angled:e631;airline_seat_individual_suite:e632;airline_seat_legroom_extra:e633;airline_seat_legroom_normal:e634;airline_seat_legroom_reduced:e635;airline_seat_recline_extra:e636;airline_seat_recline_normal:e637;airplanemode_active:e195;airplanemode_inactive:e194;airplanemode_off:e194;airplanemode_on:e195;airplay:e055;airport_shuttle:eb3c;alarm:e855;alarm_add:e856;alarm_off:e857;alarm_on:e858;album:e019;align_horizontal_center:e00f;align_horizontal_left:e00d;align_horizontal_right:e010;align_vertical_bottom:e015;align_vertical_center:e011;align_vertical_top:e00c;all_inbox:e97f;all_inclusive:eb3d;all_out:e90b;alt_route:f184;alternate_email:e0e6;amp_stories:ea13;analytics:ef3e;anchor:f1cd;android:e859;announcement:e85a;apartment:ea40;api:f1b7;app_blocking:ef3f;app_settings_alt:ef41;apps:e5c3;architecture:ea3b;archive:e149;arrow_back:e5c4;arrow_back_ios:e5e0;arrow_circle_down:f181;arrow_circle_up:f182;arrow_downward:e5db;arrow_drop_down:e5c5;arrow_drop_down_circle:e5c6;arrow_drop_up:e5c7;arrow_forward:e5c8;arrow_forward_ios:e5e1;arrow_left:e5de;arrow_right:e5df;arrow_right_alt:e941;arrow_upward:e5d8;art_track:e060;article:ef42;aspect_ratio:e85b;assessment:e85c;assignment:e85d;assignment_ind:e85e;assignment_late:e85f;assignment_return:e860;assignment_returned:e861;assignment_turned_in:e862;assistant:e39f;assistant_photo:e3a0;atm:e573;attach_email:ea5e;attach_file:e226;attach_money:e227;attachment:e2bc;attribution:efdb;audiotrack:e3a1;auto_delete:ea4c;autorenew:e863;av_timer:e01b;baby_changing_station:f19b;backpack:f19c;backspace:e14a;backup:e864;backup_table:ef43;ballot:e172;bar_chart:e26b;batch_prediction:f0f5;bathtub:ea41;battery_alert:e19c;battery_charging_full:e1a3;battery_full:e1a4;battery_std:e1a5;battery_unknown:e1a6;beach_access:eb3e;bedtime:ef44;beenhere:e52d;bento:f1f4;bike_scooter:ef45;biotech:ea3a;block:e14b;bluetooth:e1a7;bluetooth_audio:e60f;bluetooth_connected:e1a8;bluetooth_disabled:e1a9;bluetooth_searching:e1aa;blur_circular:e3a2;blur_linear:e3a3;blur_off:e3a4;blur_on:e3a5;book:e865;book_online:f217;bookmark:e866;bookmark_border:e867;bookmark_outline:e867;bookmarks:e98b;border_all:e228;border_bottom:e229;border_clear:e22a;border_horizontal:e22c;border_inner:e22d;border_left:e22e;border_outer:e22f;border_right:e230;border_style:e231;border_top:e232;border_vertical:e233;branding_watermark:e06b;brightness_1:e3a6;brightness_2:e3a7;brightness_3:e3a8;brightness_4:e3a9;brightness_5:e3aa;brightness_6:e3ab;brightness_7:e3ac;brightness_auto:e1ab;brightness_high:e1ac;brightness_low:e1ad;brightness_medium:e1ae;broken_image:e3ad;browser_not_supported:ef47;brush:e3ae;bubble_chart:e6dd;bug_report:e868;build:e869;build_circle:ef48;burst_mode:e43c;business:e0af;business_center:eb3f;cached:e86a;cake:e7e9;calculate:ea5f;calendar_today:e935;calendar_view_day:e936;call:e0b0;call_end:e0b1;call_made:e0b2;call_merge:e0b3;call_missed:e0b4;call_missed_outgoing:e0e4;call_received:e0b5;call_split:e0b6;call_to_action:e06c;camera:e3af;camera_alt:e3b0;camera_enhance:e8fc;camera_front:e3b1;camera_rear:e3b2;camera_roll:e3b3;campaign:ef49;cancel:e5c9;cancel_presentation:e0e9;cancel_schedule_send:ea39;card_giftcard:e8f6;card_membership:e8f7;card_travel:e8f8;carpenter:f1f8;casino:eb40;cast:e307;cast_connected:e308;cast_for_education:efec;category:e574;center_focus_strong:e3b4;center_focus_weak:e3b5;change_history:e86b;charging_station:f19d;chat:e0b7;chat_bubble:e0ca;chat_bubble_outline:e0cb;check:e5ca;check_box:e834;check_box_outline_blank:e835;check_circle:e86c;check_circle_outline:e92d;checkroom:f19e;chevron_left:e5cb;chevron_right:e5cc;child_care:eb41;child_friendly:eb42;chrome_reader_mode:e86d;class:e86e;clean_hands:f21f;cleaning_services:f0ff;clear:e14c;clear_all:e0b8;close:e5cd;close_fullscreen:f1cf;closed_caption:e01c;closed_caption_disabled:f1dc;cloud:e2bd;cloud_circle:e2be;cloud_done:e2bf;cloud_download:e2c0;cloud_off:e2c1;cloud_queue:e2c2;cloud_upload:e2c3;code:e86f;collections:e3b6;collections_bookmark:e431;color_lens:e3b7;colorize:e3b8;comment:e0b9;comment_bank:ea4e;commute:e940;compare:e3b9;compare_arrows:e915;compass_calibration:e57c;computer:e30a;confirmation_num:e638;confirmation_number:e638;connect_without_contact:f223;construction:ea3c;contact_mail:e0d0;contact_page:f22e;contact_phone:e0cf;contact_support:e94c;contactless:ea71;contacts:e0ba;content_copy:f08a;content_cut:f08b;content_paste:f098;control_camera:e074;control_point:e3ba;control_point_duplicate:e3bb;copy:f08a;copyright:e90c;coronavirus:f221;corporate_fare:f1d0;countertops:f1f7;create:e150;create_new_folder:e2cc;credit_card:e870;crop:e3be;crop_16_9:e3bc;crop_3_2:e3bd;crop_5_4:e3bf;crop_7_5:e3c0;crop_din:e3c1;crop_free:e3c2;crop_landscape:e3c3;crop_original:e3c4;crop_portrait:e3c5;crop_rotate:e437;crop_square:e3c6;cut:f08b;dashboard:e871;data_usage:e1af;date_range:e916;deck:ea42;dehaze:e3c7;delete:e872;delete_forever:e92b;delete_outline:e92e;delete_sweep:e16c;departure_board:e576;description:e873;design_services:f10a;desktop_access_disabled:e99d;desktop_mac:e30b;desktop_windows:e30c;details:e3c8;developer_board:e30d;developer_mode:e1b0;device_hub:e335;device_unknown:e339;devices:e1b1;devices_other:e337;dialer_sip:e0bb;dialpad:e0bc;directions:e52e;directions_bike:e52f;directions_boat:e532;directions_bus:e530;directions_car:e531;directions_ferry:e532;directions_off:f10f;directions_railway:e534;directions_run:e566;directions_subway:e533;directions_train:e534;directions_transit:e535;directions_walk:e536;disabled_by_default:f230;disc_full:e610;dns:e875;do_disturb:f08c;do_disturb_alt:f08d;do_disturb_off:f08e;do_disturb_on:f08f;do_not_step:f19f;do_not_touch:f1b0;dock:e30e;domain:e7ee;domain_disabled:e0ef;domain_verification:ef4c;done:e876;done_all:e877;done_outline:e92f;donut_large:e917;donut_small:e918;double_arrow:ea50;download:f090;download_done:f091;drafts:e151;drag_handle:e25d;drag_indicator:e945;drive_eta:e613;dry:f1b3;duo:e9a5;dvr:e1b2;dynamic_feed:ea14;dynamic_form:f1bf;east:f1df;eco:ea35;edit:e3c9;edit_attributes:e578;edit_location:e568;edit_road:ef4d;eject:e8fb;elderly:f21a;electric_bike:eb1b;electric_car:eb1c;electric_moped:eb1d;electric_rickshaw:eb1e;electric_scooter:eb1f;electrical_services:f102;elevator:f1a0;email:e0be;emoji_emotions:ea22;emoji_events:ea23;emoji_flags:ea1a;emoji_food_beverage:ea1b;emoji_nature:ea1c;emoji_objects:ea24;emoji_people:ea1d;emoji_symbols:ea1e;emoji_transportation:ea1f;engineering:ea3d;enhance_photo_translate:e8fc;enhanced_encryption:e63f;equalizer:e01d;error:e000;error_outline:e001;escalator:f1a1;escalator_warning:f1ac;euro:ea15;euro_symbol:e926;ev_station:e56d;event:e878;event_available:e614;event_busy:e615;event_note:e616;event_seat:e903;exit_to_app:e879;expand_less:e5ce;expand_more:e5cf;explicit:e01e;explore:e87a;explore_off:e9a8;exposure:e3ca;exposure_minus_1:e3cb;exposure_minus_2:e3cc;exposure_neg_1:e3cb;exposure_neg_2:e3cc;exposure_plus_1:e3cd;exposure_plus_2:e3ce;exposure_zero:e3cf;extension:e87b;face:e87c;face_unlock:f008;facebook:f234;fact_check:f0c5;family_restroom:f1a2;fast_forward:e01f;fast_rewind:e020;fastfood:e57a;favorite:e87d;favorite_border:e87e;favorite_outline:e87e;featured_play_list:e06d;featured_video:e06e;feedback:e87f;fence:f1f6;fiber_dvr:e05d;fiber_manual_record:e061;fiber_new:e05e;fiber_pin:e06a;fiber_smart_record:e062;file_copy:e173;filter:e3d3;filter_1:e3d0;filter_2:e3d1;filter_3:e3d2;filter_4:e3d4;filter_5:e3d5;filter_6:e3d6;filter_7:e3d7;filter_8:e3d8;filter_9:e3d9;filter_9_plus:e3da;filter_alt:ef4f;filter_b_and_w:e3db;filter_center_focus:e3dc;filter_drama:e3dd;filter_frames:e3de;filter_hdr:e3df;filter_list:e152;filter_none:e3e0;filter_tilt_shift:e3e2;filter_vintage:e3e3;find_in_page:e880;find_replace:e881;fingerprint:e90d;fire_extinguisher:f1d8;fireplace:ea43;first_page:e5dc;fitness_center:eb43;flag:e153;flaky:ef50;flare:e3e4;flash_auto:e3e5;flash_off:e3e6;flash_on:e3e7;flight:e539;flight_land:e904;flight_takeoff:e905;flip:e3e8;flip_camera_android:ea37;flip_camera_ios:ea38;flip_to_back:e882;flip_to_front:e883;folder:e2c7;folder_open:e2c8;folder_shared:e2c9;folder_special:e617;follow_the_signs:f222;font_download:e167;food_bank:f1f2;format_align_center:e234;format_align_justify:e235;format_align_left:e236;format_align_right:e237;format_bold:e238;format_clear:e239;format_color_reset:e23b;format_indent_decrease:e23d;format_indent_increase:e23e;format_italic:e23f;format_line_spacing:e240;format_list_bulleted:e241;format_list_numbered:e242;format_list_numbered_rtl:e267;format_paint:e243;format_quote:e244;format_shapes:e25e;format_size:e245;format_strikethrough:e246;format_textdirection_l_to_r:e247;format_textdirection_r_to_l:e248;format_underline:e249;format_underlined:e249;forum:e0bf;forward:e154;forward_10:e056;forward_30:e057;forward_5:e058;forward_to_inbox:f187;foundation:f200;free_breakfast:eb44;fullscreen:e5d0;fullscreen_exit:e5d1;functions:e24a;g_translate:e927;gamepad:e30f;games:e021;gavel:e90e;gesture:e155;get_app:e884;gif:e908;golf_course:eb45;gps_fixed:e1b3;gps_not_fixed:e1b4;gps_off:e1b5;grade:e885;gradient:e3e9;grading:ea4f;grain:e3ea;graphic_eq:e1b8;grass:f205;grid_off:e3eb;grid_on:e3ec;group:e7ef;group_add:e7f0;group_work:e886;groups:f233;handyman:f10b;hd:e052;hdr_off:e3ed;hdr_on:e3ee;hdr_strong:e3f1;hdr_weak:e3f2;headset:e310;headset_mic:e311;healing:e3f3;hearing:e023;hearing_disabled:f104;height:ea16;help:e887;help_center:f1c0;help_outline:e8fd;high_quality:e024;highlight:e25f;highlight_alt:ef52;highlight_off:e888;highlight_remove:e888;history:e889;history_edu:ea3e;history_toggle_off:f17d;home:e88a;home_repair_service:f100;home_work:ea09;horizontal_distribute:e014;horizontal_rule:f108;horizontal_split:e947;hot_tub:eb46;hotel:e53a;hourglass_bottom:ea5c;hourglass_disabled:ef53;hourglass_empty:e88b;hourglass_full:e88c;hourglass_top:ea5b;house:ea44;house_siding:f202;how_to_reg:e174;how_to_vote:e175;http:e902;https:e88d;hvac:f10e;image:e3f4;image_aspect_ratio:e3f5;image_not_supported:f116;image_search:e43f;import_contacts:e0e0;import_export:e0c3;important_devices:e912;inbox:e156;indeterminate_check_box:e909;info:e88e;info_outline:e88f;input:e890;insert_chart:e24b;insert_chart_outlined:e26a;insert_comment:e24c;insert_drive_file:e24d;insert_emoticon:e24e;insert_invitation:e24f;insert_link:e250;insert_photo:e251;insights:f092;integration_instructions:ef54;invert_colors:e891;invert_colors_off:e0c4;invert_colors_on:e891;iso:e3f6;keyboard:e312;keyboard_arrow_down:e313;keyboard_arrow_left:e314;keyboard_arrow_right:e315;keyboard_arrow_up:e316;keyboard_backspace:e317;keyboard_capslock:e318;keyboard_control:e5d3;keyboard_hide:e31a;keyboard_return:e31b;keyboard_tab:e31c;keyboard_voice:e31d;king_bed:ea45;kitchen:eb47;label:e892;label_important:e937;label_important_outline:e948;label_off:e9b6;label_outline:e893;landscape:e3f7;language:e894;laptop:e31e;laptop_chromebook:e31f;laptop_mac:e320;laptop_windows:e321;last_page:e5dd;launch:e895;layers:e53b;layers_clear:e53c;leaderboard:f20c;leak_add:e3f8;leak_remove:e3f9;leave_bags_at_home:f23b;legend_toggle:f11b;lens:e3fa;library_add:e02e;library_add_check:e9b7;library_books:e02f;library_music:e030;lightbulb_outline:e90f;line_style:e919;line_weight:e91a;linear_scale:e260;link:e157;link_off:e16f;linked_camera:e438;list:e896;list_alt:e0ee;live_help:e0c6;live_tv:e639;local_activity:e53f;local_airport:e53d;local_atm:e53e;local_attraction:e53f;local_bar:e540;local_cafe:e541;local_car_wash:e542;local_convenience_store:e543;local_dining:e556;local_drink:e544;local_fire_department:ef55;local_florist:e545;local_gas_station:e546;local_grocery_store:e547;local_hospital:e548;local_hotel:e549;local_laundry_service:e54a;local_library:e54b;local_mall:e54c;local_movies:e54d;local_offer:e54e;local_parking:e54f;local_pharmacy:e550;local_phone:e551;local_pizza:e552;local_play:e553;local_police:ef56;local_post_office:e554;local_print_shop:e555;local_printshop:e555;local_restaurant:e556;local_see:e557;local_shipping:e558;local_taxi:e559;location_city:e7f1;location_disabled:e1b6;location_history:e55a;location_off:e0c7;location_on:e0c8;location_searching:e1b7;lock:e897;lock_open:e898;lock_outline:e899;login:ea77;looks:e3fc;looks_3:e3fb;looks_4:e3fd;looks_5:e3fe;looks_6:e3ff;looks_one:e400;looks_two:e401;loop:e028;loupe:e402;low_priority:e16d;loyalty:e89a;luggage:f235;mail:e158;mail_outline:e0e1;map:e55b;maps_ugc:ef58;mark_chat_read:f18b;mark_chat_unread:f189;mark_email_read:f18c;mark_email_unread:f18a;markunread:e159;markunread_mailbox:e89b;masks:f218;maximize:e930;mediation:efa7;medical_services:f109;meeting_room:eb4f;memory:e322;menu:e5d2;menu_book:ea19;menu_open:e9bd;merge_type:e252;message:e0c9;messenger:e0ca;messenger_outline:e0cb;mic:e029;mic_none:e02a;mic_off:e02b;microwave:f204;military_tech:ea3f;minimize:e931;miscellaneous_services:f10c;missed_video_call:e073;mms:e618;mobile_friendly:e200;mobile_off:e201;mobile_screen_share:e0e7;mode:f097;mode_comment:e253;model_training:f0cf;monetization_on:e263;money:e57d;money_off:e25c;money_off_csred:f038;monochrome_photos:e403;mood:e7f2;mood_bad:e7f3;moped:eb28;more:e619;more_horiz:e5d3;more_time:ea5d;more_vert:e5d4;motion_photos_on:e9c1;motion_photos_pause:f227;motion_photos_paused:e9c2;motorcycle:e91b;mouse:e323;move_to_inbox:e168;movie:e02c;movie_creation:e404;movie_filter:e43a;multiline_chart:e6df;multiple_stop:f1b9;multitrack_audio:e1b8;museum:ea36;music_note:e405;music_off:e440;music_video:e063;my_library_add:e02e;my_library_books:e02f;my_library_music:e030;my_location:e55c;nat:ef5c;nature:e406;nature_people:e407;navigate_before:e408;navigate_next:e409;navigation:e55d;near_me:e569;near_me_disabled:f1ef;network_check:e640;network_locked:e61a;new_releases:e031;next_plan:ef5d;next_week:e16a;nfc:e1bb;night_shelter:f1f1;nights_stay:ea46;no_backpack:f237;no_cell:f1a4;no_drinks:f1a5;no_encryption:e641;no_encryption_gmailerrorred:f03f;no_flash:f1a6;no_food:f1a7;no_luggage:f23b;no_meals:f1d6;no_meeting_room:eb4e;no_photography:f1a8;no_sim:e0cc;no_stroller:f1af;no_transfer:f1d5;north:f1e0;north_east:f1e1;north_west:f1e2;not_accessible:f0fe;not_interested:e033;not_listed_location:e575;not_started:f0d1;note:e06f;note_add:e89c;notes:e26c;notification_important:e004;notifications:e7f4;notifications_active:e7f7;notifications_none:e7f5;notifications_off:e7f6;notifications_on:e7f7;notifications_paused:e7f8;now_wallpaper:e1bc;now_widgets:e1bd;offline_bolt:e932;offline_pin:e90a;ondemand_video:e63a;online_prediction:f0eb;opacity:e91c;open_in_browser:e89d;open_in_full:f1ce;open_in_new:e89e;open_with:e89f;outbond:f228;outdoor_grill:ea47;outlet:f1d4;outlined_flag:e16e;pages:e7f9;pageview:e8a0;palette:e40a;pan_tool:e925;panorama:e40b;panorama_fish_eye:e40c;panorama_fisheye:e40c;panorama_horizontal:e40d;panorama_vertical:e40e;panorama_wide_angle:e40f;party_mode:e7fa;paste:f098;pause:e034;pause_circle_filled:e035;pause_circle_outline:e036;pause_presentation:e0ea;payment:e8a1;payments:ef63;pedal_bike:eb29;pending:ef64;pending_actions:f1bb;people:e7fb;people_alt:ea21;people_outline:e7fc;perm_camera_mic:e8a2;perm_contact_cal:e8a3;perm_contact_calendar:e8a3;perm_data_setting:e8a4;perm_device_info:e8a5;perm_device_information:e8a5;perm_identity:e8a6;perm_media:e8a7;perm_phone_msg:e8a8;perm_scan_wifi:e8a9;person:e7fd;person_add:e7fe;person_add_alt_1:ef65;person_add_disabled:e9cb;person_outline:e7ff;person_pin:e55a;person_pin_circle:e56a;person_remove:ef66;person_remove_alt_1:ef67;person_search:f106;personal_video:e63b;pest_control:f0fa;pest_control_rodent:f0fd;pets:e91d;phone:e0cd;phone_android:e324;phone_bluetooth_speaker:e61b;phone_callback:e649;phone_disabled:e9cc;phone_enabled:e9cd;phone_forwarded:e61c;phone_in_talk:e61d;phone_iphone:e325;phone_locked:e61e;phone_missed:e61f;phone_paused:e620;phonelink:e326;phonelink_erase:e0db;phonelink_lock:e0dc;phonelink_off:e327;phonelink_ring:e0dd;phonelink_setup:e0de;photo:e410;photo_album:e411;photo_camera:e412;photo_filter:e43b;photo_library:e413;photo_size_select_actual:e432;photo_size_select_large:e433;photo_size_select_small:e434;picture_as_pdf:e415;picture_in_picture:e8aa;picture_in_picture_alt:e911;pie_chart:e6c4;pie_chart_outline:f044;pin_drop:e55e;place:e55f;plagiarism:ea5a;play_arrow:e037;play_circle_fill:e038;play_circle_filled:e038;play_circle_outline:e039;play_for_work:e906;playlist_add:e03b;playlist_add_check:e065;playlist_play:e05f;plumbing:f107;plus_one:e800;point_of_sale:f17e;policy:ea17;poll:e801;polymer:e8ab;pool:eb48;portable_wifi_off:e0ce;portrait:e416;post_add:ea20;power:e63c;power_input:e336;power_off:e646;power_settings_new:e8ac;precision_manufacturing:f049;pregnant_woman:e91e;present_to_all:e0df;preview:f1c5;print:e8ad;print_disabled:e9cf;priority_high:e645;privacy_tip:f0dc;psychology:ea4a;public:e80b;public_off:f1ca;publish:e255;published_with_changes:f232;push_pin:f10d;qr_code:ef6b;qr_code_2:e00a;qr_code_scanner:f206;query_builder:e8ae;question_answer:e8af;queue:e03c;queue_music:e03d;queue_play_next:e066;quick_contacts_dialer:e0cf;quick_contacts_mail:e0d0;quickreply:ef6c;radio:e03e;radio_button_checked:e837;radio_button_off:e836;radio_button_on:e837;radio_button_unchecked:e836;rate_review:e560;read_more:ef6d;receipt:e8b0;receipt_long:ef6e;recent_actors:e03f;record_voice_over:e91f;redeem:e8b1;redo:e15a;reduce_capacity:f21c;refresh:e5d5;remove:e15b;remove_circle:e15c;remove_circle_outline:e15d;remove_from_queue:e067;remove_red_eye:e417;remove_shopping_cart:e928;reorder:e8fe;repeat:e040;repeat_one:e041;replay:e042;replay_10:e059;replay_30:e05a;replay_5:e05b;reply:e15e;reply_all:e15f;report:e160;report_gmailerrorred:f052;report_off:e170;report_problem:e8b2;request_page:f22c;request_quote:f1b6;restaurant:e56c;restaurant_menu:e561;restore:e8b3;restore_from_trash:e938;restore_page:e929;rice_bowl:f1f5;ring_volume:e0d1;roofing:f201;room:e8b4;room_preferences:f1b8;room_service:eb49;rotate_90_degrees_ccw:e418;rotate_left:e419;rotate_right:e41a;rounded_corner:e920;router:e328;rowing:e921;rss_feed:e0e5;rule:f1c2;rule_folder:f1c9;run_circle:ef6f;rv_hookup:e642;sanitizer:f21d;satellite:e562;save:e161;save_alt:e171;scanner:e329;scatter_plot:e268;schedule:e8b5;school:e80c;science:ea4b;score:e269;screen_lock_landscape:e1be;screen_lock_portrait:e1bf;screen_lock_rotation:e1c0;screen_rotation:e1c1;screen_share:e0e2;sd_card:e623;sd_card_alert:f057;sd_storage:e1c2;search:e8b6;search_off:ea76;security:e32a;select_all:e162;self_improvement:ea78;send:e163;sensor_door:f1b5;sensor_window:f1b4;sentiment_dissatisfied:e811;sentiment_satisfied:e813;sentiment_satisfied_alt:e0ed;sentiment_very_dissatisfied:e814;sentiment_very_satisfied:e815;set_meal:f1ea;settings:e8b8;settings_applications:e8b9;settings_backup_restore:e8ba;settings_bluetooth:e8bb;settings_brightness:e8bd;settings_cell:e8bc;settings_display:e8bd;settings_ethernet:e8be;settings_input_antenna:e8bf;settings_input_component:e8c0;settings_input_composite:e8c1;settings_input_hdmi:e8c2;settings_input_svideo:e8c3;settings_overscan:e8c4;settings_phone:e8c5;settings_power:e8c6;settings_remote:e8c7;settings_system_daydream:e1c3;settings_voice:e8c8;share:e80d;shop:e8c9;shop_two:e8ca;shopping_bag:f1cc;shopping_basket:e8cb;shopping_cart:e8cc;short_text:e261;show_chart:e6e1;shuffle:e043;shutter_speed:e43d;sick:f220;signal_cellular_4_bar:e1c8;signal_cellular_alt:e202;signal_cellular_connected_no_internet_4_bar:e1cd;signal_cellular_no_sim:e1ce;signal_cellular_null:e1cf;signal_cellular_off:e1d0;signal_wifi_4_bar:e1d8;signal_wifi_4_bar_lock:e1d9;signal_wifi_off:e1da;sim_card:e32b;single_bed:ea48;skip_next:e044;skip_previous:e045;slideshow:e41b;slow_motion_video:e068;smart_button:f1c1;smartphone:e32c;smoke_free:eb4a;smoking_rooms:eb4b;sms:e625;sms_failed:e626;snippet_folder:f1c7;snooze:e046;soap:f1b2;sort:e164;sort_by_alpha:e053;source:f1c4;south:f1e3;south_east:f1e4;south_west:f1e5;spa:eb4c;space_bar:e256;speaker:e32d;speaker_group:e32e;speaker_notes:e8cd;speaker_notes_off:e92a;speaker_phone:e0d2;speed:e9e4;spellcheck:e8ce;sports:ea30;sports_bar:f1f3;sports_baseball:ea51;sports_basketball:ea26;sports_cricket:ea27;sports_esports:ea28;sports_football:ea29;sports_golf:ea2a;sports_handball:ea33;sports_hockey:ea2b;sports_kabaddi:ea34;sports_mma:ea2c;sports_motorsports:ea2d;sports_rugby:ea2e;sports_soccer:ea2f;sports_tennis:ea32;sports_volleyball:ea31;square_foot:ea49;stacked_line_chart:f22b;stairs:f1a9;star:e838;star_border:e83a;star_border_purple500:f099;star_half:e839;star_outline:f06f;star_purple500:f09a;star_rate:f0ec;stars:e8d0;stay_current_landscape:e0d3;stay_current_portrait:e0d4;stay_primary_landscape:e0d5;stay_primary_portrait:e0d6;sticky_note_2:f1fc;stop:e047;stop_circle:ef71;stop_screen_share:e0e3;storage:e1db;store:e8d1;store_mall_directory:e563;storefront:ea12;straighten:e41c;streetview:e56e;strikethrough_s:e257;stroller:f1ae;style:e41d;subdirectory_arrow_left:e5d9;subdirectory_arrow_right:e5da;subject:e8d2;subscript:f111;subscriptions:e064;subtitles:e048;subtitles_off:ef72;subway:e56f;superscript:f112;supervised_user_circle:e939;supervisor_account:e8d3;support:ef73;support_agent:f0e2;surround_sound:e049;swap_calls:e0d7;swap_horiz:e8d4;swap_horizontal_circle:e933;swap_vert:e8d5;swap_vert_circle:e8d6;swap_vertical_circle:e8d6;switch_camera:e41e;switch_left:f1d1;switch_right:f1d2;switch_video:e41f;sync:e627;sync_alt:ea18;sync_disabled:e628;sync_problem:e629;system_update:e62a;system_update_alt:e8d7;system_update_tv:e8d7;tab:e8d8;tab_unselected:e8d9;table_chart:e265;table_rows:f101;table_view:f1be;tablet:e32f;tablet_android:e330;tablet_mac:e331;tag_faces:e420;tap_and_play:e62b;tapas:f1e9;terrain:e564;text_fields:e262;text_format:e165;text_rotate_up:e93a;text_rotate_vertical:e93b;text_rotation_angledown:e93c;text_rotation_angleup:e93d;text_rotation_down:e93e;text_rotation_none:e93f;text_snippet:f1c6;textsms:e0d8;texture:e421;theaters:e8da;thermostat:f076;thumb_down:e8db;thumb_down_alt:e816;thumb_up:e8dc;thumb_up_alt:e817;thumbs_up_down:e8dd;time_to_leave:e62c;timelapse:e422;timeline:e922;timer:e425;timer_10:e423;timer_3:e424;timer_off:e426;title:e264;toc:e8de;today:e8df;toggle_off:e9f5;toggle_on:e9f6;toll:e8e0;tonality:e427;topic:f1c8;touch_app:e913;tour:ef75;toys:e332;track_changes:e8e1;traffic:e565;train:e570;tram:e571;transfer_within_a_station:e572;transform:e428;transit_enterexit:e579;translate:e8e2;trending_down:e8e3;trending_flat:e8e4;trending_neutral:e8e4;trending_up:e8e5;trip_origin:e57b;tty:f1aa;tune:e429;turned_in:e8e6;turned_in_not:e8e7;tv:e333;tv_off:e647;two_wheeler:e9f9;umbrella:f1ad;unarchive:e169;undo:e166;unfold_less:e5d6;unfold_more:e5d7;unpublished:f236;unsubscribe:e0eb;update:e923;update_disabled:e075;upgrade:f0fb;upload:f09b;usb:e1e0;verified:ef76;verified_user:e8e8;vertical_align_bottom:e258;vertical_align_center:e259;vertical_align_top:e25a;vertical_distribute:e076;vertical_split:e949;vibration:e62d;video_call:e070;video_collection:e04a;video_label:e071;video_library:e04a;video_settings:ea75;videocam:e04b;videocam_off:e04c;videogame_asset:e338;view_agenda:e8e9;view_array:e8ea;view_carousel:e8eb;view_column:e8ec;view_comfortable:e42a;view_comfy:e42a;view_compact:e42b;view_day:e8ed;view_headline:e8ee;view_list:e8ef;view_module:e8f0;view_quilt:e8f1;view_sidebar:f114;view_stream:e8f2;view_week:e8f3;vignette:e435;visibility:e8f4;visibility_off:e8f5;voice_chat:e62e;voice_over_off:e94a;voicemail:e0d9;volume_down:e04d;volume_mute:e04e;volume_off:e04f;volume_up:e050;vpn_key:e0da;vpn_lock:e62f;wallet_giftcard:e8f6;wallet_membership:e8f7;wallet_travel:e8f8;wallpaper:e1bc;warning:e002;warning_amber:f083;wash:f1b1;watch:e334;watch_later:e924;water_damage:f203;waves:e176;wb_auto:e42c;wb_cloudy:e42d;wb_incandescent:e42e;wb_iridescent:e436;wb_sunny:e430;wc:e63d;web:e051;web_asset:e069;weekend:e16b;west:f1e6;whatshot:e80e;wheelchair_pickup:f1ab;where_to_vote:e177;widgets:e1bd;wifi:e63e;wifi_calling:ef77;wifi_lock:e1e1;wifi_off:e648;wifi_protected_setup:f0fc;wifi_tethering:e1e2;wine_bar:f1e8;work:e8f9;work_off:e942;work_outline:e943;wrap_text:e25b;wrong_location:ef78;wysiwyg:f1c3;youtube_searched_for:e8fa;zoom_in:e8ff;zoom_out:e900;zoom_out_map:e56b"
        }
    },
    
    iconSet: "skin",
    registerIconSet : function (iconSet) {
        if (!isc.Media.iconSets) isc.Media.iconSets = {};
    },

    // this is called lazily, from isc.Media methods that try to access stockIcons 
    initMedia : function (iconSet) {
        if (isc.Media.mediaInitialized) {
            // initMedia() can be called before the skin loads, so loadSkin() will call it again,
            // so the media from the skin is picked up
            // clear the current groups and standard blocks from several places
            isc.Media.clearStockIconGroups();
            if (isc.Canvas) isc.Canvas.standardActionIcons = null;
            if (isc.Window) isc.Window.standardHeaderIcons = null;
        }

        // legacy - apply filtered stockIcon lists to several framework classes
        isc.Media.addStockIconGroup("action", "Action Icons");
        if (isc.Canvas) {
            // make a copy of the "action" stockIcon group and alter the name-format from 
            // "Group_Icon" to just "Icon" - 13.0 uses the first of those formats for 
            // uniqueness; the latter format is for backcompat to pre-13.0 skins, which 
            // referred to these icons with their old names
            var icons = isc.Media.getStockIcons("action");
            var canvasIcons = [];
            icons.map(function(i) {
                var newIcon = { name: i.name.replace("Action_", ""), group: i.group, states: i.states };
                canvasIcons.add(newIcon);
            });
            isc.Canvas.addClassProperties({ standardActionIcons: canvasIcons });
        }

        isc.Media.addStockIconGroup("header", "Header Icons");
        if (isc.Window) {
            // make a copy of the "header" stockIcon group and alter the name-format from 
            // "Group_Icon" to just "Icon" - 13.0 uses the first of those formats for 
            // uniqueness; the latter format is for backcompat to pre-13.0 skins, which 
            // referred to these icons with their old names
            var icons = isc.Media.getStockIcons("header");
            var windowIcons = [];
            icons.map(function(i) {
                var newIcon = { name: i.name.replace("Header_", ""), group: i.group, states: i.states };
                windowIcons.add(newIcon);
            });
            isc.Window.addClassProperties({ standardHeaderIcons: windowIcons });
        }

        if (isc.Class && isc.Class.standardClassIcons) {
            if (!isc.Media.stardarClassIconsInitialized) {
                // Class is initialized before Media, so need to add its standardClassIcons 
                // entries to the stockIcon list, if they're present (Tools is loaded)
                isc.Media.stockIcons.addList(isc.Class.standardClassIcons);
                isc.Media.stardarClassIconsInitialized = true;
            }
            isc.Media.addStockIconGroup("classIcons", "Class Icons", null, "[TOOLSIMG]");
        }

        isc.Media.stockIconsMap = isc.Media.stockIcons.makeIndex("name");

        // apply parsed "src" attributes to all the stockIcons
        for (var key in isc.Media.stockIconsMap) {
            var icon = isc.Media.stockIconsMap[key],
                group = isc.Media.stockIconGroupsMap[icon.group] || {},
                defaultExt = icon.group == "header" ? isc.Canvas.standardHeaderIconExtension : null,
                pSrc = (group.scImgURLPrefix || "[SKINIMG]") + icon.scImgURL
            ;
            if (defaultExt) {
                pSrc = pSrc.substring(0, pSrc.indexOf(".")+1) + defaultExt;
            }
            icon.parsedURL = pSrc;
            //icon.pageURL = isc.Page.getURL(pSrc);
            icon.src = isc.Canvas.getImgURL(pSrc);
        }

        isc.Media.iconNameToSrcMap = isc.Media.stockIcons.getValueMap("name", "src");
        isc.Media.currentSrcMap = isc.Media.stockIcons.makeIndex("src");

        var records = [];

        var imageSrcMap = {};
        // init groups, by building their DSs and making indexes for fast access later
        for (var i=0; i<isc.Media.stockIconGroups.length; i++) {
            var group = isc.Media.stockIconGroups[i];
            var ds = isc.Media.getStockIconDS(group.name);
            if (ds) {
                //group.nameToSrcMap = ds.cacheData.getValueMap("name", "src");
                //group.srcToNameMap = ds.cacheData.getValueMap("src", "name");
                imageSrcMap = isc.addProperties(imageSrcMap, ds.cacheData.makeIndex("src"));
                records.addList(ds.cacheData);
            }
        }

        // this is a map of all stockIcons, url to stockIcon record - that record has stuff like
        // Name, dimensions, and so on
        isc.Media.imageSrcMap = imageSrcMap;
        imageSrcMap = null;

        isc.Media.mediaInitialized = true;
        
        // if passed an iconSet name, use it now
        if (iconSet && iconSet != "skin") isc.Media.useMedia(iconSet);
    },

    useMedia : function (iconSet) {
        if (!isc.Media.mediaInitialized) isc.Media.initMedia();

        if (iconSet) isc.Media.iconSet = iconSet;

        isc.Media.fontIconMap = {};
        if (isc.Media.iconSet == "materialIcons") {
            isc.Media.fontIconMap = isc.Media.iconSets["materialIcons"].iconMap;
            for (var key in this.iconNameToSrcMap) {
                if (isc.Media.fontIconMap[key]) {
                    isc.Media.currentSrcMap[this.iconNameToSrcMap[key]] = "font:value:" + 
                        isc.Media.fontIconMap[key] + ";cssClass:material-icons;"
                }
            }

            // isc.Media.currentSrcMap is a map of full image-URL to possible font-config
        }
        isc.Media.iconNameToSrcMap = isc.Media.stockIcons.getValueMap("name", "src");

        // clear CSS caches to that styles and potentially icons get refreshed
        isc.Canvas.clearCSSCaches();
    },

    // stockIcon config
    _stockIconConfig: {},
    _notStockIconConfig: {},
    // don't check for "icon:" or "stock:" prefixes on a src - we don't use any as yet 
    allowStockPrefix: false,
    allowIconPrefix: false,
    isStockIconConfig : function (src) {
        if (!src || !isc.Media.mediaInitialized) return false;
        // if the src has been seen before, it will be in one of these two objects
        if (isc.Media._stockIconConfig[src]) {
            //c.logWarn("skipped " + src);
            return true;
        }
        if (isc.Media._notStockIconConfig[src]) {
            //c.logWarn("skipped " + src);
            return false
        }

        // otherwise, find out if it's a stockIcon, and cache the result
        var map = isc.Media.iconNameToSrcMap,
            result
        ;
        if (map && map[src]) {
            // just a stockKey, like "Edit", that exists in the stockIcons list
            result = true;
        } else {
            // a stockIcon config, like "stock:Edit" or "icon:MyCustomIcon" - they're the same,
            // right now, and both are switched off by default
            result = (isc.Media.allowStockPrefix && src.startsWith("stock:")) || 
                (isc.Media.allowIconPrefix &&src.startsWith("icon:"));
        }

        if (result) isc.Media._stockIconConfig[src] = true;
        else isc.Media._notStockIconConfig[src] = true;
        return result;
    },
    getStockIconSrc : function (src) {
        // return whatever icon-definition is currently assigned to the passed stockKey - that
        // is, the current value of isc.Media.iconNameToSrcMap[stockKey]
        if (!isc.Media.mediaInitialized) return src;
        var stockKey = src;
        //this.logWarn("in getStockIconSrc, checking src: " + src); 
        if (isc.Media.isStockIconConfig(stockKey)) {
            //this.logWarn("src is " + src + "  -- stockKey is " + stockKey);
            if (isc.Media.allowStockPrefix && stockKey.startsWith("stock:")) {
                stockKey = stockKey.substring(6);
            } else if (isc.Media.allowIconPrefix && stockKey.startsWith("icon:")) {
                stockKey = stockKey.substring(5);
            }
            // otherwise, it's just a stockKey (stockIcon name), with no prefix - also valid
            //this.logWarn("stockKey is now -- " + stockKey);
        }
        return isc.Media.iconNameToSrcMap[stockKey] || stockKey;
    },

    mapImgURL : function (src) {
        if (!isc.Media.mediaInitialized) return src;
        return isc.Media.currentSrcMap[src] || src;
    },

    // flag that prevents checking for fontIcons in Canvas.imgHTML() and saves some time - not 
    // a lot, since isFontIconConfig() caches its results
    allowFontPrefix: true,
    // cache of src strings that were / were not fontIconConfigs
    _fontIconConfig: {},
    _notFontIconConfig: {},
    // is the passed string a formatted fontIcon-config?
    isFontIconConfig : function (src) {
        if (!isc.Media.allowFontPrefix || !src) return false;
        // if the src has been seen before, it will be in one of these two objects
        if (isc.Media._fontIconConfig[src]) {
            //isc.logWarn("skipped " + src);
            return true;
        }
        if (isc.Media._notFontIconConfig[src]) {
            //isc.logWarn("skipped " + src);
            return false;
        }
        // otherwise, it's a fontConfig if it starts with "font:"
        var result = isc.isA.String(src) && src.startsWith("font:");
        // cache the result for next time
        if (result) isc.Media._fontIconConfig[src] = true;
        else isc.Media._notFontIconConfig[src] = true;
        return result;
    },
    // parse a fontIcon string into a config object
    getFontIconConfig : function (src) {
        if (!isc.Media.isFontIconConfig(src)) return null;
        // lazily init the stock media on first access
        if (!isc.Media.mediaInitialized) isc.Media.initMedia();
        var result = {};
        var parts = src.substring(5).split(";");
        for (var i=0; i<parts.length; i++) {
            var item = parts[i].split(":");
            if (item[0]=="name" || item[0]=="family") {
                result["font-family"] = item[1];
            } else if (item[0]=="size") {
                if (item[1] == null) {
                    isc.logWarn("Null fontIcon size...");
                }
                result["font-size"] = item[1];
            } else if (item[0]=="color") {
                result["color"] = item[1];
            } else if (item[0]=="cssClass") {
                result.cssClass = item[1];
            } else if (item[0]=="value") {
                result.value = item[1];
            }
        }
        return result;
    },

    // helper to return the HTML for a span containing an icon from a font
    getFontIconHTML : function (config) {
        
        if (!isc.Media.isFontIconConfig(config)) return config;
        var parts = config.substring(5).split(";");
        var style = "";
        var cssClass = null;
        var value = "";
        for (var i=0; i<parts.length; i++) {
            var item = parts[i].split(":");
            if (item[0]=="name" || item[0]=="family") {
                style += "font-family:" + item[1] + ";";
            } else if (item[0]=="size") {
                style += "font-size:" + item[1] + ";";
            } else if (item[0]=="color") {
                style += "color:" + item[1] + ";";
            } else if (item[0]=="cssClass") {
                cssClass = item[1];
            } else if (item[0]=="value") {
                value = item[1];
            }
        }
        var result = "<span" + (cssClass ? " class='" + cssClass + "'": "");
        if (style.length > 0) result += " style='" + style + "'";
        result += ">" + value + "</span>";
        return result;
    }
});

isc.Media.addClassProperties({
    // define metadata for the framework-wide standard actionIcons
    stockIcons: [
        // group: "action" - all icons from images/actions
        {
            index: 10, 
            scImgURL:"actions/edit.png", 
            name:"Edit", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 20, 
            scImgURL:"actions/approve.png", 
            name:"Approve",
            group: "action"
        }, 
        {
            index: 30, 
            scImgURL:"actions/accept.png", 
            name:"Accept",
            group: "action"
        }, 
        {
            index: 40, 
            scImgURL:"actions/ok.png", 
            name:"Ok",
            group: "action"
        }, 
        {
            index: 50, 
            scImgURL:"actions/plus.png", 
            name:"Plus", 
            group: "action",
            "states":[
                "Disabled"
            ]
        },
        {
            index: 60, 
            scImgURL:"actions/add.png", 
            name:"Add", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 70, 
            scImgURL:"actions/remove.png", 
            name:"Remove", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 80, 
            scImgURL:"actions/cancel.png", 
            name:"Cancel",
            group: "action"
        }, 
        {
            index: 90, 
            scImgURL:"actions/close.png", 
            name:"Close", 
            group: "action",
            "states":[
                "Disabled", 
                "Down", 
                "Over"
            ]
        }, 
        {
            index: 100, 
            scImgURL:"actions/exclamation.png", 
            name:"Exclamation",
            group: "action"
        }, 
        {
            index: 110, 
            scImgURL:"actions/help.png", 
            name:"Help",
            group: "action"
        },
        {
            index: 120, 
            scImgURL:"actions/undo.png", 
            name:"Undo",
            group: "action"
        }, 
        {
            index: 130, 
            scImgURL:"actions/redo.png", 
            name:"Redo",
            group: "action"
        }, 
        {
            index: 140, 
            scImgURL:"actions/refresh.png", 
            name:"Refresh", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 150, 
            scImgURL:"actions/first.png", 
            name:"First",
            group: "action"
        }, 
        {
            index: 160, 
            scImgURL:"actions/prev.png", 
            name:"Prev",
            group: "action"
        }, 
        {
            index: 170, 
            scImgURL:"actions/next.png", 
            name:"Next",
            group: "action"
        }, 
        {
            index: 180, 
            scImgURL:"actions/last.png", 
            name:"Last",
            group: "action"
        }, 
        {
            index: 190, 
            scImgURL:"actions/back.png", 
            name:"Back", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 200, 
            scImgURL:"actions/forward.png", 
            name:"Forward", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 210, 
            scImgURL:"actions/auto_fit.png", 
            name:"Auto_fit",
            group: "action"
        }, 
        {
            index: 220, 
            scImgURL:"actions/auto_fit_all.png", 
            name:"Auto_fit_all",
            group: "action"
        }, 
        {
            index: 230, 
            scImgURL:"actions/freezeLeft.png", 
            name:"FreezeLeft",
            group: "action"
        }, 
        {
            index: 240, 
            scImgURL:"actions/freezeRight.png", 
            name:"FreezeRight",
            group: "action"
        }, 
        {
            index: 250, 
            scImgURL:"actions/unfreeze.png", 
            name:"Unfreeze",
            group: "action"
        }, 
        {
            index: 260, 
            scImgURL:"actions/groupby.png", 
            name:"Groupby",
            group: "action"
        }, 
        {
            index: 270, 
            scImgURL:"actions/column_preferences.png", 
            name:"Column_preferences",
            group: "action"
        }, 
        {
            index: 280, 
            scImgURL:"actions/configure.png", 
            name:"Configure",
            group: "action"
        }, 
        {
            index: 290, 
            scImgURL:"actions/configure_sort.png", 
            name:"Configure_sort",
            group: "action"
        }, 
        {
            index: 300, 
            scImgURL:"actions/sort_ascending.png", 
            name:"Sort_ascending",
            group: "action"
        }, 
        {
            index: 310, 
            scImgURL:"actions/sort_descending.png", 
            name:"Sort_descending",
            group: "action"
        }, 
        {
            index: 320, 
            scImgURL:"actions/clear_sort.png", 
            name:"Clear_sort",
            group: "action"
        }, 
        {
            index: 330, 
            scImgURL:"actions/text_linespacing.png", 
            name:"Text_linespacing",
            group: "action"
        },
        {
            index: 340, 
            scImgURL:"actions/ungroup.png", 
            name:"Ungroup",
            group: "action"
        }, 
        {
            index: 350, 
            scImgURL:"actions/drag.png", 
            name:"Drag", 
            group: "action",
            "states":[
                "Disabled"
            ]
        }, 
        {
            index: 360, 
            scImgURL:"actions/print.png", 
            name:"Print",
            group: "action"
        }, 
        {
            index: 370, 
            scImgURL:"actions/save.png", 
            name:"Save",
            group: "action"
        }, 
        {
            index: 380, 
            scImgURL:"actions/dynamic.png", 
            name:"Dynamic",
            group: "action"
        }, 
        {
            index: 390, 
            scImgURL:"actions/filter.png", 
            name:"Filter",
            group: "action"
        }, 
        {
            index: 394, 
            scImgURL:"actions/filterActive.png", 
            name:"FilterActive",
            group: "action"
        }, 
        {
            index: 400, 
            scImgURL:"actions/search.png", 
            name:"Search",
            group: "action"
        }, 
        {
            index: 410, 
            scImgURL:"actions/view.png", 
            name:"View",
            group: "action"
        }, 
        {
            index: 420, 
            scImgURL:"actions/view_rtl.png", 
            name:"View_rtl",
            group: "action"
        },
        {
            index: 430, 
            scImgURL:"actions/download.png", 
            name:"Download",
            group: "action"
        }, 
        {
            index: 440, 
            scImgURL:"actions/color_swatch.png", 
            name:"Color_swatch",
            group: "action"
        },
        {
            index: 450, 
            scImgURL:"actions/clearFilter.png", 
            name:"ClearFilter",
            group: "action"
        },
        {
            index: 460, 
            scImgURL:"actions/export.png", 
            name:"Export",
            group: "action"
        }

,
        {
            index: 470, 
            scImgURL:"actions/add_files.png", 
            name:"Add_Files",
            states: ["disabled"],
            group: "action"
        },
        {
            index: 480, 
            scImgURL:"actions/remove_files.png", 
            name:"Remove_Files",
            states: ["disabled"],
            group: "action"
        },
        
        // images/buttons - empty
        
        // images/Calendar
        {
            index: 600, 
            scImgURL:"Calendar/gripper.png", 
            name:"Gripper",
            group: "calendar"
        },
        {
            index: 610, 
            scImgURL:"Calendar/leadingDateGripper.png", 
            name:"LeadingDate_Gripper",
            group: "calendar"
        },
        {
            index: 620, 
            scImgURL:"Calendar/trailingDateGripper.png", 
            name:"TrailingDate_Gripper",
            group: "calendar"
        },

        // images/Class - empty

        // images/ColorPicker
        {
            index: 700, 
            scImgURL:"ColorPicker/close.png", 
            name:"ColorPicker_Close",
            group: "colorPicker"
        },
        {
            index: 710, 
            scImgURL:"ColorPicker/crosshair.png", 
            name:"Crosshair",
            group: "colorPicker"
        },

        // images/controls - I think these icons all come from images/DynamicForm now

        // images/cssButton - stretch images - presumably old

        // images/CubeGrid
        // add with indexes from 800 

        // images/DateChooser
        {
            index: 900, 
            scImgURL:"DateChooser/arrow_left.png", 
            name:"DateChooser_Previous",
            group: "dateChooser"
        },
        {
            index: 910, 
            scImgURL:"DateChooser/arrow_right.png", 
            name:"DateChooser_Next",
            group: "dateChooser"
        },
        {
            index: 920, 
            scImgURL:"DateChooser/doubleArrow_left.png", 
            name:"DateChooser_First",
            group: "dateChooser"
        },
        {
            index: 930, 
            scImgURL:"DateChooser/doubleArrow_right.png", 
            name:"DateChooser_Last",
            group: "dateChooser"
        },

        // images/Dialog
        {
            index: 1000, 
            scImgURL:"Dialog/ask.png", 
            name:"Dialog_Ask",
            states: ["disabled"],
            group: "dialog"
        },
        {
            index: 1010, 
            scImgURL:"Dialog/confirm.png", 
            name:"Dialog_Confirm",
            states: ["disabled"],
            group: "dialog"
        },
        {
            index: 1020, 
            scImgURL:"Dialog/error.png", 
            name:"Dialog_Error",
            states: ["disabled"],
            group: "dialog"
        },
        {
            index: 1030, 
            scImgURL:"Dialog/notify.png", 
            name:"Dialog_Notify",
            states: ["disabled"],
            group: "dialog"
        },
        {
            index: 1040, 
            scImgURL:"Dialog/say.png", 
            name:"Dialog_Say",
            states: ["disabled"],
            group: "dialog"
        },
        {
            index: 1050, 
            scImgURL:"Dialog/stop.png", 
            name:"Dialog_Stop",
            states: ["disabled"],
            group: "dialog"
        },
        {
            index: 1060, 
            scImgURL:"Dialog/warn.png", 
            name:"Dialog_Warn",
            states: ["disabled"],
            group: "dialog"
        },
        
        // images/FileBrowser - index 1100+ - not sure if these are "stock", per-se

        // images/GradientEditor
        {
            index: 1200, 
            scImgURL:"GradientEditor/stopBar_stopBottom.png", 
            name:"StopButton_Up",
            group: "gradientEditor"
        },
        {
            index: 1210, 
            scImgURL:"GradientEditor/stopBar_stopTop.png", 
            name:"StopButton_Down",
            group: "gradientEditor"
        },
        {
            index: 1220, 
            scImgURL:"GradientEditor/transparency.png", 
            name:"Transparency",
            group: "gradientEditor"
        },
        
        // images/headerIcons - 1300+ - applies elsewhere in this file
        
        // images/Imgbutton - don't think these are needed, future-wise
        
        // images/iOS - single image "more", not sure what it's used for
        {
            index: 1500, 
            scImgURL:"iOS/more.png", 
            name:"iOS_More",
            group: "iOS"
        },
        
        // images/ListGrid - 1600+ - add some of these 
        {
            index: 1600, 
            scImgURL:"ListGrid/formula_menuItem.png", 
            name:"Grid_Formula",
            group: "ListGrid"
        }, 
        {
            index: 1610, 
            scImgURL:"ListGrid/group_closed.png", 
            name:"Grid_Group_closed",
            group: "ListGrid"
        }, 
        {
            index: 1620, 
            scImgURL:"ListGrid/group_opened.png", 
            name:"Grid_Group_opened",
            group: "ListGrid"
        }, 
        {
            index: 1630, 
            scImgURL:"ListGrid/row_collapsed.png", 
            name:"Grid_Row_collapsed",
            group: "ListGrid"
        }, 
        {
            index: 1640, 
            scImgURL:"ListGrid/row_expanded.png", 
            name:"Grid_Row_expanded",
            group: "ListGrid"
        }, 
        {
            index: 1650, 
            scImgURL:"ListGrid/sort_ascending.png", 
            name:"Grid_Sort_ascending",
            group: "ListGrid"
        }, 
        {
            index: 1660, 
            scImgURL:"ListGrid/sort_descending.png", 
            name:"Grid_Sort_descending",
            group: "ListGrid"
        }, 

        // images/Menu - 1700+ = add some of these 

        // images/MultiUploadItem - add files and remove files icons moved to "actions"

        // images/NavigationBar - not sure about these ones just yet

        // 
        {
            index: 2000, 
            scImgURL:"Notify/checkmark.png", 
            name:"Notify_checkmark",
            group: "notify"
        },
        {
            index: 2010, 
            scImgURL:"Notify/close.png", 
            name:"Notify_close",
            group: "notify"
        },
        {
            index: 2020, 
            scImgURL:"Notify/error.png", 
            name:"Notify_error",
            group: "notify"
        },
        {
            index: 2030, 
            scImgURL:"Notify/warning.png", 
            name:"Notify_warning",
            group: "notify"
        },
        
        // images/Panel - nothing
        
        // images/pickers - these are all old, using sprites now
        
        // images/ProgressBar - nothing
        
        // images/RecordEditor - add/remove icons, probably should be using the usual ones
        
        // images/RichTextEditor - these should be added, eventually
        
        // images/SchemaViewer - nothing stock
        
        // images/Scrollbar - sprites
        
        // images/SectionHeader - 
        {
            index: 2500, 
            scImgURL:"SectionHeader/opener_closed.png", 
            name:"SectionHeader_closed",
            group: "sectionHeader"
        },
        {
            index: 2510, 
            scImgURL:"SectionHeader/opener_opened.png", 
            name:"SectionHeader_opened",
            group: "sectionHeader"
        },
        
        // images/shared - nothing
        // images/Slider - nothing relevant
        // images/Splitbar - maybe later
        // images/Tab - nothing
        // images/TabSet
        {
            index: 2700, 
            scImgURL:"TabSet/close.png", 
            name:"TabSet_close",
            group: "tabSet"
        },

        // images/ToolStrip
        {
            index: 2800, 
            scImgURL:"ToolStrip/hresizer.png", 
            name:"ToolStrip_hresizer",
            group: "toolStrip"
        },
        {
            index: 2810, 
            scImgURL:"ToolStrip/hseparator.png", 
            name:"ToolStrip_hseparator",
            group: "toolStrip"
        },
        {
            index: 2820, 
            scImgURL:"ToolStrip/resizer.png", 
            name:"ToolStrip_vresizer",
            group: "toolStrip"
        },
        {
            index: 2830, 
            scImgURL:"ToolStrip/separator.png", 
            name:"ToolStrip_vseparator",
            group: "toolStrip"
        },

        // images/TransferIcons - probably need to be done
        
        // images/TreeGrid
        {
            index: 3000, 
            scImgURL:"TreeGrid/file.png", 
            name:"Tree_leaf",
            group: "treeGrid"
        },
        {
            index: 3010, 
            scImgURL:"TreeGrid/folder.png", 
            name:"Tree_folder",
            group: "treeGrid"
        },
        {
            index: 3020, 
            scImgURL:"TreeGrid/folder_closed.png", 
            name:"Tree_folderclosed",
            group: "treeGrid"
        },
        {
            index: 3030, 
            scImgURL:"TreeGrid/folder_drop.png", 
            name:"Tree_folderdrop",
            group: "treeGrid"
        },
        {
            index: 3040, 
            scImgURL:"TreeGrid/folder_file.png", 
            name:"Tree_folderfile",
            group: "treeGrid"
        },
        {
            index: 3050, 
            scImgURL:"TreeGrid/folder_loading.gif", 
            name:"Tree_folderloading",
            group: "treeGrid"
        },
        {
            index: 3060, 
            scImgURL:"TreeGrid/folder_open.png", 
            name:"Tree_folderopened",
            group: "treeGrid"
        },
        {
            index: 3070, 
            scImgURL:"TreeGrid/opener_closed.png", 
            name:"Tree_opener_closed",
            group: "treeGrid"
        },
        {
            index: 3080, 
            scImgURL:"TreeGrid/opener_opened.png", 
            name:"Tree_opener_opened",
            group: "treeGrid"
        },

        
        // images/Window - these are all in the "headerIcons" dir in Flat skins
        
        {
            index: 5000,
            scImgURL: "loading_horizontal.gif",
            name:"Loading",
            group: "action"
        }

    ]
});

// define metadata for the framework-wide standard headerIcons
isc.Media.stockIcons.addList([
    {
        index: 1300,
        scImgURL:"headerIcons/arrow_down.png", 
        name:"Header_Arrow_down", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1310,
        scImgURL:"headerIcons/arrow_left.png", 
        name:"Header_Arrow_left", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1320,
        scImgURL:"headerIcons/arrow_right.png", 
        name:"Header_Arrow_right", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1330,
        scImgURL:"headerIcons/arrow_up.png", 
        name:"Header_Arrow_up", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1340,
        scImgURL:"headerIcons/calculator.png", 
        name:"Header_Calculator", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1350,
        scImgURL:"headerIcons/cart.png", 
        name:"Header_Cart", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1360,
        scImgURL:"headerIcons/cascade.png", 
        name:"Header_Cascade", 
        group: "header",
        states:[
            "Disabled", 
            "Over"
        ]
    }, 
    {
        index: 1370,
        scImgURL:"headerIcons/clipboard.png", 
        name:"Header_Clipboard", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1380,
        scImgURL:"headerIcons/clock.png", 
        name:"Header_Clock", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1390,
        scImgURL:"headerIcons/close.png", 
        name:"Header_Close", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1400,
        scImgURL:"headerIcons/comment.png", 
        name:"Header_Comment", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1410,
        scImgURL:"headerIcons/document.png", 
        name:"Header_Document", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1420,
        scImgURL:"headerIcons/double_arrow_down.png", 
        name:"Header_Double_arrow_down", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1430,
        scImgURL:"headerIcons/double_arrow_left.png", 
        name:"Header_Double_arrow_left", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1440,
        scImgURL:"headerIcons/double_arrow_right.png", 
        name:"Header_Double_arrow_right", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1450,
        scImgURL:"headerIcons/double_arrow_up.png", 
        name:"Header_Double_arrow_up", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1460,
        scImgURL:"headerIcons/favourite.png", 
        name:"Header_Favourite", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1470,
        scImgURL:"headerIcons/find.png", 
        name:"Header_Find", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1480,
        scImgURL:"headerIcons/help.png", 
        name:"Header_Help", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1490,
        scImgURL:"headerIcons/home.png", 
        name:"Header_Home", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1500,
        scImgURL:"headerIcons/mail.png", 
        name:"Header_Mail", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1510,
        scImgURL:"headerIcons/maximize.png", 
        name:"Header_Maximize", 
        group: "header",
        states:[
            "Down", 
            "Over"
        ]
    }, 
    {
        index: 1540,
        scImgURL:"headerIcons/minimize.png", 
        name:"Header_Minimize", 
        group: "header",
        states:[
            "Disabled", 
            "Over"
        ]
    }, 
    {
        index: 1550,
        scImgURL:"headerIcons/minus.png", 
        name:"Header_Minus", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1560,
        scImgURL:"headerIcons/person.png", 
        name:"Header_Person", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1570,
        scImgURL:"headerIcons/pin_down.png", 
        name:"Header_Pin_down", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1580,
        scImgURL:"headerIcons/pin_left.png", 
        name:"Header_Pin_left", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1590,
        scImgURL:"headerIcons/plus.png", 
        name:"Header_Plus", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1600,
        scImgURL:"headerIcons/print.png", 
        name:"Header_Print", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1610,
        scImgURL:"headerIcons/refresh.png", 
        name:"Header_Refresh", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1620,
        scImgURL:"headerIcons/refresh_thin.png", 
        name:"Header_Refresh_thin", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1630,
        scImgURL:"headerIcons/save.png", 
        name:"Header_Save", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1640,
        scImgURL:"headerIcons/settings.png", 
        name:"Header_Settings", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1650,
        scImgURL:"headerIcons/transfer.png", 
        name:"Header_Transfer", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1660,
        scImgURL:"headerIcons/trash.png", 
        name:"Header_Trash", 
        group: "header",
        states:[
            "Over"
        ]
    }, 
    {
        index: 1670,
        scImgURL:"headerIcons/zoom.png", 
        name:"Header_Zoom", 
        group: "header",
        states:[
            "Over"
        ]
    }
]);
