// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for classroom page component.
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { ClassroomBackendApiService } from 'domain/classroom/classroom-backend-api.service';
import { ClassroomData } from 'domain/classroom/classroom-data.model';
import { UrlInterpolationService } from 'domain/utilities/url-interpolation.service';
import { CapitalizePipe } from 'filters/string-utility-filters/capitalize.pipe';
import { AccessValidationBackendApiService } from 'pages/oppia-root/routing/access-validation-backend-api.service';
import { AlertsService } from 'services/alerts.service';
import { UrlService } from 'services/contextual/url.service';
import { I18nLanguageCodeService } from 'services/i18n-language-code.service';
import { LoaderService } from 'services/loader.service';
import { PageTitleService } from 'services/page-title.service';
import { SiteAnalyticsService } from 'services/site-analytics.service';
import { MockTranslatePipe } from 'tests/unit-test-utils';
import { ClassroomPageComponent } from './classroom-page.component';

class MockCapitalizePipe {
  transform(input: string): string {
    return input;
  }
}

class MockTranslateService {
  onLangChange: EventEmitter<string> = new EventEmitter();
  instant(key: string, interpolateParams?: Object): string {
    return key;
  }
}

describe('Classroom Page Component', () => {
  let component: ClassroomPageComponent;
  let fixture: ComponentFixture<ClassroomPageComponent>;
  let urlInterpolationService: UrlInterpolationService;
  let urlService: UrlService;
  let loaderService: LoaderService;
  let classroomBackendApiService: ClassroomBackendApiService;
  let pageTitleService: PageTitleService;
  let siteAnalyticsService: SiteAnalyticsService;
  let alertsService: AlertsService;
  let accessValidationBackendApiService: AccessValidationBackendApiService;
  let i18nLanguageCodeService: I18nLanguageCodeService;
  let translateService: TranslateService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        ClassroomPageComponent,
        MockTranslatePipe
      ],
      providers: [
        AlertsService,
        {
          provide: CapitalizePipe,
          useClass: MockCapitalizePipe
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        ClassroomBackendApiService,
        LoaderService,
        PageTitleService,
        SiteAnalyticsService,
        UrlInterpolationService,
        UrlService,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassroomPageComponent);
    component = fixture.componentInstance;
    urlInterpolationService = TestBed.inject(UrlInterpolationService);
    urlService = TestBed.inject(UrlService);
    loaderService = TestBed.inject(LoaderService);
    classroomBackendApiService = TestBed.inject(ClassroomBackendApiService);
    pageTitleService = TestBed.inject(PageTitleService);
    siteAnalyticsService = TestBed.inject(SiteAnalyticsService);
    alertsService = TestBed.inject(AlertsService);
    i18nLanguageCodeService = TestBed.inject(I18nLanguageCodeService);
    accessValidationBackendApiService = TestBed.inject(
      AccessValidationBackendApiService);
    translateService = TestBed.inject(TranslateService);

    spyOn(i18nLanguageCodeService, 'isCurrentLanguageRTL').and.returnValue(
      true);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should get RTL language status correctly', () => {
    expect(component.isLanguageRTL()).toBeTrue();
  });

  it('should provide static image url', () => {
    let imageUrl = 'image_url';
    spyOn(urlInterpolationService, 'getStaticImageUrl')
      .and.returnValue(imageUrl);
    expect(component.getStaticImageUrl('test')).toEqual(imageUrl);
  });

  it('should initialize', fakeAsync(() => {
    let classroomUrlFragment = 'test_fragment';
    let bannerImageUrl = 'banner_image_url';
    spyOn(urlService, 'getClassroomUrlFragmentFromUrl')
      .and.returnValue(classroomUrlFragment);
    spyOn(urlInterpolationService, 'getStaticImageUrl')
      .and.returnValue(bannerImageUrl);
    spyOn(loaderService, 'showLoadingScreen');
    spyOn(component, 'setPageTitle');
    spyOn(component, 'subscribeToOnLangChange');
    spyOn(loaderService, 'hideLoadingScreen');
    spyOn(classroomBackendApiService.onInitializeTranslation, 'emit');
    spyOn(siteAnalyticsService, 'registerClassroomPageViewed');
    let classroomData = ClassroomData.createFromBackendData(
      'Math', [], 'Course details', 'Topics covered');
    spyOn(accessValidationBackendApiService, 'validateAccessToClassroomPage')
      .and.returnValues(
        Promise.reject(),
        Promise.resolve()
      );
    spyOn(classroomBackendApiService, 'fetchClassroomDataAsync')
      .and.returnValue(Promise.resolve(classroomData));
    spyOn(i18nLanguageCodeService, 'getClassroomTranslationKey')
      .and.returnValue('I18N_CLASSROOM_MATH_TITLE');
    spyOn(i18nLanguageCodeService, 'isHackyTranslationAvailable')
      .and.returnValue(true);
    spyOn(i18nLanguageCodeService, 'isCurrentLanguageEnglish')
      .and.returnValue(false);
    component.ngOnInit();
    tick();
    tick();
    expect(component.classroomUrlFragment).toEqual(classroomUrlFragment);
    expect(component.bannerImageFileUrl).toEqual(bannerImageUrl);
    expect(loaderService.showLoadingScreen).toHaveBeenCalled();
    expect(classroomBackendApiService.fetchClassroomDataAsync)
      .toHaveBeenCalled();
    expect(component.classroomData).toEqual(classroomData);
    expect(component.classroomDisplayName).toEqual(classroomData.getName());
    expect(component.classroomNameTranslationKey).toBe(
      'I18N_CLASSROOM_MATH_TITLE');
    expect(component.isHackyClassroomTranslationDisplayed()).toBe(true);
    expect(component.setPageTitle).toHaveBeenCalled();
    expect(component.subscribeToOnLangChange).toHaveBeenCalled();
    expect(loaderService.hideLoadingScreen).toHaveBeenCalled();
    expect(classroomBackendApiService.onInitializeTranslation.emit)
      .toHaveBeenCalled();
    expect(siteAnalyticsService.registerClassroomPageViewed).toHaveBeenCalled();
  }));

  it('should display alert when unable to fetch classroom data',
    fakeAsync(() => {
      let classroomUrlFragment = 'test_fragment';
      let bannerImageUrl = 'banner_image_url';
      spyOn(urlService, 'getClassroomUrlFragmentFromUrl')
        .and.returnValue(classroomUrlFragment);
      spyOn(urlInterpolationService, 'getStaticImageUrl')
        .and.returnValue(bannerImageUrl);
      spyOn(loaderService, 'showLoadingScreen');
      spyOn(accessValidationBackendApiService, 'validateAccessToClassroomPage')
        .and.returnValue(Promise.resolve());
      spyOn(classroomBackendApiService, 'fetchClassroomDataAsync')
        .and.returnValue(Promise.reject({ status: 500 }));
      spyOn(alertsService, 'addWarning');
      component.ngOnInit();
      tick();
      expect(component.classroomUrlFragment).toEqual(classroomUrlFragment);
      expect(component.bannerImageFileUrl).toEqual(bannerImageUrl);
      expect(loaderService.showLoadingScreen).toHaveBeenCalled();
      expect(classroomBackendApiService.fetchClassroomDataAsync)
        .toHaveBeenCalled();
      expect(alertsService.addWarning).toHaveBeenCalledWith(
        'Failed to get dashboard data');
    }));

  it('should obtain translated page title whenever the selected' +
  'language changes', () => {
    component.subscribeToOnLangChange();
    spyOn(component, 'setPageTitle');
    translateService.onLangChange.emit();

    expect(component.directiveSubscriptions.closed).toBe(false);
    expect(component.setPageTitle).toHaveBeenCalled();
  });

  it('should set new page title', () => {
    spyOn(translateService, 'instant').and.callThrough();
    spyOn(pageTitleService, 'setDocumentTitle');
    component.classroomDisplayName = 'dummy_name';
    component.setPageTitle();

    expect(translateService.instant).toHaveBeenCalledWith(
      'I18N_CLASSROOM_PAGE_TITLE', {
        classroomName: 'dummy_name'
      });
    expect(pageTitleService.setDocumentTitle).toHaveBeenCalledWith(
      'I18N_CLASSROOM_PAGE_TITLE');
  });

  it('should unsubscribe on component destruction', () => {
    component.subscribeToOnLangChange();
    expect(component.directiveSubscriptions.closed).toBe(false);
    component.ngOnDestroy();

    expect(component.directiveSubscriptions.closed).toBe(true);
  });
});
